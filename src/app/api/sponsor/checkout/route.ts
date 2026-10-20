import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/newsletter";
import { checkoutConfigured, createCheckoutSession, type Product } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`checkout:${ip}`, 10)) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  const { product } = (await req.json().catch(() => ({}))) as { product?: unknown };
  if (product !== "featured" && product !== "newsletter") {
    return NextResponse.json({ ok: false, message: "Unknown product." }, { status: 400 });
  }
  if (!checkoutConfigured(product as Product)) {
    return NextResponse.json({ ok: false, message: "Sponsorship checkout is not open yet." }, { status: 503 });
  }

  try {
    const session = await createCheckoutSession(product as Product);
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("checkout error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, message: "Could not start checkout. Please try again later." }, { status: 502 });
  }
}
