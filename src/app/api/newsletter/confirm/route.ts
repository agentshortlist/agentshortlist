import { NextResponse } from "next/server";
import { addToSegment, getContact, newsletterConfigured, rateLimited, readToken, sendWelcomeEmail, setUnsubscribed } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`confirm:${ip}`, 20)) return NextResponse.json({ ok: false, message: "Too many attempts." }, { status: 429 });
  if (!newsletterConfigured()) return NextResponse.json({ ok: false, message: "The newsletter is not available yet." }, { status: 503 });

  const { token } = (await req.json().catch(() => ({}))) as { token?: unknown };
  const email = readToken(token, "confirm");
  if (!email) return NextResponse.json({ ok: false, message: "This link is invalid or has expired." }, { status: 400 });

  try {
    const before = await getContact(email);
    await setUnsubscribed(email, false);
    await addToSegment(email);
    // Solo en la primera confirmación: repetir el enlace no reenvía la bienvenida.
    if (before?.unsubscribed) {
      try {
        await sendWelcomeEmail(email);
      } catch (err) {
        console.error("newsletter welcome error:", err instanceof Error ? err.message : "unknown");
      }
    }
    return NextResponse.json({ ok: true, message: "Subscription confirmed." });
  } catch (err) {
    console.error("newsletter confirm error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, message: "Something went wrong. Please try again later." }, { status: 502 });
  }
}
