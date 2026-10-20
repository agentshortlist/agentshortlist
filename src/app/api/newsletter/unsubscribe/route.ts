import { NextResponse } from "next/server";
import { newsletterConfigured, rateLimited, readToken, setUnsubscribed } from "@/lib/newsletter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`unsub:${ip}`, 20)) return NextResponse.json({ ok: false, message: "Too many attempts." }, { status: 429 });
  if (!newsletterConfigured()) return NextResponse.json({ ok: false, message: "The newsletter is not available yet." }, { status: 503 });

  const { token } = (await req.json().catch(() => ({}))) as { token?: unknown };
  const email = readToken(token, "unsubscribe");
  if (!email) return NextResponse.json({ ok: false, message: "This link is invalid." }, { status: 400 });

  try {
    await setUnsubscribed(email, true);
    return NextResponse.json({ ok: true, message: "You have been unsubscribed." });
  } catch (err) {
    console.error("newsletter unsubscribe error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ ok: false, message: "Something went wrong. Please try again later." }, { status: 502 });
  }
}
