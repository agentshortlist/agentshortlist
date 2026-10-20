import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "@/lib/site";

// Variables de entorno (las crea el propietario; nunca se imprimen ni se commitean):
//   STRIPE_SECRET_KEY        clave secreta de PRUEBA (sk_test_...) hasta que se pase a producción
//   STRIPE_WEBHOOK_SECRET    secreto del endpoint de webhook (whsec_...)
//   STRIPE_PRICE_FEATURED    id del precio mensual del Featured listing (price_...)
//   STRIPE_PRICE_NEWSLETTER  id del precio único del patrocinio de newsletter (price_...)
// STRIPE_API_BASE existe solo para pruebas locales contra un Stripe simulado.
const API = () => (process.env.STRIPE_API_BASE ?? "https://api.stripe.com").replace(/\/$/, "");

export type Product = "featured" | "newsletter";

export const checkoutConfigured = (p: Product) =>
  Boolean(process.env.STRIPE_SECRET_KEY && (p === "featured" ? process.env.STRIPE_PRICE_FEATURED : process.env.STRIPE_PRICE_NEWSLETTER));

export const webhookConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

// Stripe espera application/x-www-form-urlencoded con claves anidadas: a[b][0][c]=valor
export function formEncode(obj: Record<string, unknown>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) =>
        typeof item === "object" && item !== null
          ? out.push(...formEncode(item as Record<string, unknown>, `${key}[${i}]`))
          : out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`),
      );
    } else if (typeof v === "object") {
      out.push(...formEncode(v as Record<string, unknown>, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

async function stripe(path: string, init: { method?: string; body?: Record<string, unknown>; revalidate?: number } = {}) {
  const res = await fetch(`${API()}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(init.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: init.body ? formEncode(init.body).join("&") : undefined,
    ...(init.revalidate !== undefined ? { next: { revalidate: init.revalidate } } : { cache: "no-store" as const }),
  });
  if (!res.ok) throw new Error(`stripe ${init.method ?? "GET"} ${path.split("?")[0]} failed: ${res.status}`);
  return res.json();
}

// ---- Checkout ----
export async function createCheckoutSession(product: Product) {
  const price = product === "featured" ? process.env.STRIPE_PRICE_FEATURED! : process.env.STRIPE_PRICE_NEWSLETTER!;
  const meta = { product };
  const session = await stripe("/v1/checkout/sessions", {
    method: "POST",
    body: {
      mode: product === "featured" ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${SITE_URL}/sponsor/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/sponsor/cancel`,
      metadata: meta,
      ...(product === "featured" ? { subscription_data: { metadata: meta } } : { payment_intent_data: { metadata: meta } }),
      // Datos del listing: se copian a los metadatos de la suscripción en el webhook, siempre sin aprobar.
      custom_fields: [
        { key: "tool_name", label: { type: "custom", custom: "Tool or product name" }, type: "text", text: { maximum_length: 60 } },
        { key: "tool_url", label: { type: "custom", custom: "Website (https://...)" }, type: "text", text: { maximum_length: 200 } },
        { key: "tagline", label: { type: "custom", custom: "One-line description" }, type: "text", optional: true, text: { maximum_length: 140 } },
      ],
    },
  });
  return { id: session.id as string, url: session.url as string };
}

// ---- Webhook: verificación de firma (esquema v1 de Stripe) ----
export function verifyWebhook(rawBody: string, header: string | null, secret: string, toleranceSec = 300, nowSec = Math.floor(Date.now() / 1000)) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  ) as Record<string, string>;
  const t = Number(parts.t);
  if (!t || Math.abs(nowSec - t) > toleranceSec) return false;
  const sigs = header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.slice(3));
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex"));
  return sigs.some((s) => {
    const given = Buffer.from(s);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function copyListingToSubscription(subscriptionId: string, fields: { tool_name: string; tool_url: string; tagline: string }) {
  // approved=false: nada se muestra hasta que el propietario lo apruebe en Stripe.
  await stripe(`/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "POST",
    body: { metadata: { product: "featured", ...fields, approved: "false" } },
  });
}

// ---- Patrocinadores activos y aprobados (Stripe es la fuente de verdad) ----
export type Sponsor = { id: string; name: string; url: string; tagline: string };

const clean = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/<[^>]*>/g, "") // quita etiquetas completas, no solo los signos
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .trim()
    .slice(0, max);

export async function getSponsors(): Promise<Sponsor[]> {
  if (!process.env.STRIPE_SECRET_KEY) return [];
  try {
    const list = await stripe("/v1/subscriptions?status=active&limit=100", { revalidate: 600 });
    const out: Sponsor[] = [];
    for (const sub of list.data ?? []) {
      const m = sub.metadata ?? {};
      if (m.approved !== "true" || m.product !== "featured") continue;
      const name = clean(m.tool_name, 60);
      let url = "";
      try {
        const u = new URL(clean(m.tool_url, 200));
        if (u.protocol === "https:") url = u.toString();
      } catch {}
      if (!name || !url) continue;
      out.push({ id: String(sub.id), name, url, tagline: clean(m.tagline, 140) });
    }
    return out.slice(0, 3);
  } catch {
    return [];
  }
}

// ---- Precio visible (de Stripe, no escrito a mano) ----
export async function getPriceLabel(product: Product): Promise<string | null> {
  const id = product === "featured" ? process.env.STRIPE_PRICE_FEATURED : process.env.STRIPE_PRICE_NEWSLETTER;
  if (!process.env.STRIPE_SECRET_KEY || !id) return null;
  try {
    const p = await stripe(`/v1/prices/${encodeURIComponent(id)}`, { revalidate: 3600 });
    if (typeof p.unit_amount !== "number" || !p.currency) return null;
    const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: String(p.currency).toUpperCase(), maximumFractionDigits: p.unit_amount % 100 === 0 ? 0 : 2 }).format(p.unit_amount / 100);
    return p.recurring?.interval ? `${amount} / ${p.recurring.interval}` : `${amount} one-time`;
  } catch {
    return null;
  }
}
