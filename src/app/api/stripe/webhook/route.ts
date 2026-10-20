import { NextResponse } from "next/server";
import { copyListingToSubscription, verifyWebhook, webhookConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

type CustomField = { key?: string; text?: { value?: string | null } };
type CheckoutSession = { mode?: string; subscription?: string | null; custom_fields?: CustomField[] };

export async function POST(req: Request) {
  if (!webhookConfigured()) return NextResponse.json({ ok: false }, { status: 503 });

  // El cuerpo debe leerse crudo: la firma se calcula sobre los bytes exactos.
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET!)) {
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: CheckoutSession } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data?.object ?? {};
    if (s.mode === "subscription" && s.subscription) {
      const field = (key: string) => (s.custom_fields ?? []).find((f) => f.key === key)?.text?.value ?? "";
      try {
        await copyListingToSubscription(s.subscription, {
          tool_name: field("tool_name"),
          tool_url: field("tool_url"),
          tagline: field("tagline"),
        });
      } catch (err) {
        console.error("webhook error:", err instanceof Error ? err.message : "unknown");
        return NextResponse.json({ ok: false }, { status: 500 }); // Stripe reintenta
      }
    }
  }
  return NextResponse.json({ received: true });
}
