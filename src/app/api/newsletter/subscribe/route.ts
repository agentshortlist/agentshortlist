import { NextResponse } from "next/server";
import {
  createPendingContact,
  getContact,
  newsletterConfigured,
  rateLimited,
  sendConfirmationEmail,
  validEmail,
} from "@/lib/newsletter";

export const runtime = "nodejs";

// Respuesta idéntica para cualquier dirección válida: no revela si ya estaba suscrita.
const OK = { ok: true, message: "Check your inbox to confirm your subscription." };

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`sub:${ip}`)) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let body: { email?: unknown; website?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: los bots rellenan el campo oculto; fingimos éxito sin hacer nada.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json(OK);

  const email = validEmail(body.email);
  if (!email) return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });

  if (!newsletterConfigured()) {
    return NextResponse.json({ ok: false, message: "The newsletter is not available yet." }, { status: 503 });
  }

  try {
    const existing = await getContact(email);
    if (existing && !existing.unsubscribed) return NextResponse.json(OK); // ya confirmado: no reenviar nada
    if (!existing) await createPendingContact(email);
    await sendConfirmationEmail(email);
    return NextResponse.json(OK);
  } catch (err) {
    console.error("newsletter subscribe error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, message: "Something went wrong. Please try again later." }, { status: 502 });
  }
}
