import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

// Variables de entorno (las crea el propietario; nunca se imprimen ni se commitean):
// RESEND_API_KEY, RESEND_FROM, NEWSLETTER_TOKEN_SECRET; opcionales: RESEND_REPLY_TO, RESEND_SEGMENT_ID.
// Las propiedades de contacto signup_source y alerts_interest deben existir antes en Resend (scripts/resend-create-properties.mjs).
const RESEND = "https://api.resend.com";

export const newsletterConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM && process.env.NEWSLETTER_TOKEN_SECRET);

export function validEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  return /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(email) ? email : null;
}

// ---- Tokens firmados (HMAC-SHA256), sin estado en servidor ----
const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (payload: string) =>
  createHmac("sha256", process.env.NEWSLETTER_TOKEN_SECRET!).update(payload).digest("base64url");

export type TokenAction = "confirm" | "unsubscribe";

export function makeToken(action: TokenAction, email: string, ttlHours?: number) {
  const exp = ttlHours ? Date.now() + ttlHours * 3600_000 : 0; // 0 = sin caducidad (baja)
  const payload = `${action}.${b64(email)}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: unknown, action: TokenAction): string | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== action) return null;
  const payload = parts.slice(0, 3).join(".");
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(parts[3]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const exp = Number(parts[2]);
  if (exp !== 0 && Date.now() > exp) return null;
  try {
    return Buffer.from(parts[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
}

// ---- Limitación de frecuencia: en memoria, por instancia (mejor esfuerzo) ----
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 5, windowMs = 10 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}

// ---- Cliente mínimo de Resend (sin dependencias) ----
async function resend(path: string, init: RequestInit = {}) {
  return fetch(`${RESEND}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getContact(email: string): Promise<{ id: string; unsubscribed: boolean } | null> {
  const res = await resend(`/contacts/${encodeURIComponent(email)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`resend get contact failed: ${res.status}`);
  const c = await res.json();
  return { id: c.id, unsubscribed: Boolean(c.unsubscribed) };
}

export async function createPendingContact(email: string) {
  const res = await resend("/contacts", { method: "POST", body: JSON.stringify({ email, unsubscribed: true }) });
  if (!res.ok) throw new Error(`resend create contact failed: ${res.status}`);
}

// Origen del alta e interés en alertas, como propiedades del contacto. Mejor esfuerzo: si Resend rechaza la llamada
// (p. ej. las propiedades aún no existen) se registra el estado HTTP y la suscripción sigue adelante.
export const SIGNUP_SOURCES = ["home", "post", "check", "tools", "radar", "other"] as const;
export type SignupMeta = { source: (typeof SIGNUP_SOURCES)[number]; alerts: boolean };

export function readSignupMeta(source: unknown, alerts: unknown): SignupMeta {
  const s = SIGNUP_SOURCES.find((x) => x === source) ?? "other";
  return { source: s, alerts: alerts === true };
}

export async function setSignupMeta(email: string, meta: SignupMeta) {
  try {
    const res = await resend(`/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: { signup_source: meta.source, alerts_interest: meta.alerts ? "yes" : "no" } }),
    });
    if (!res.ok) console.error("newsletter signup meta not stored:", res.status);
  } catch {
    console.error("newsletter signup meta not stored: network error");
  }
}

export async function setUnsubscribed(email: string, unsubscribed: boolean) {
  const res = await resend(`/contacts/${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribed }),
  });
  if (!res.ok) throw new Error(`resend update contact failed: ${res.status}`);
}

export async function addToSegment(email: string) {
  const segment = process.env.RESEND_SEGMENT_ID;
  if (!segment) return;
  const res = await resend(`/contacts/${encodeURIComponent(email)}/segments/${segment}`, { method: "POST" });
  if (!res.ok) throw new Error(`resend add to segment failed: ${res.status}`);
}

export async function sendConfirmationEmail(email: string) {
  const link = absoluteUrl(`/newsletter/confirm?token=${encodeURIComponent(makeToken("confirm", email, 48))}`);
  const res = await resend("/emails", {
    method: "POST",
    body: JSON.stringify({
      from: process.env.RESEND_FROM,
      to: [email],
      ...(process.env.RESEND_REPLY_TO ? { reply_to: process.env.RESEND_REPLY_TO } : {}),
      subject: `Confirm your ${SITE_NAME} subscription`,
      html:
        `<p>Someone, hopefully you, asked to receive the ${SITE_NAME} newsletter at this address.</p>` +
        `<p><a href="${link}">Confirm my subscription</a></p>` +
        `<p>The link works for 48 hours. If you did not ask for this, ignore this email and nothing will be sent to you.</p>`,
      text: `Confirm your ${SITE_NAME} subscription: ${link}\n\nThe link works for 48 hours. If you did not ask for this, ignore this email.`,
    }),
  });
  if (!res.ok) throw new Error(`resend send email failed: ${res.status}`);
}
