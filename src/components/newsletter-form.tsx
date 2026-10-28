"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

type State = { status: "idle" | "loading" | "done" | "error"; message: string };

// `source` indica desde dónde se apunta la gente (por defecto, según la página). `alertsOption` añade una casilla de interés en alertas
// por servidor: se envía a GA4 como medida de demanda y se guarda como propiedad del contacto en Resend (alerts_interest).
export function NewsletterForm({ compact = false, source, alertsOption = false }: { compact?: boolean; source?: string; alertsOption?: boolean }) {
  const pathname = usePathname() ?? "/";
  const where = source ?? (pathname === "/" ? "home" : pathname.startsWith("/blog") ? "post" : pathname.startsWith("/check") ? "check" : pathname.startsWith("/radar") ? "radar" : pathname.startsWith("/pick") || pathname.startsWith("/compare") ? "tools" : "other");
  const [state, setState] = useState<State>({ status: "idle", message: "" });
  const busy = state.status === "loading" || state.status === "done";
  const id = compact ? "nl-email-compact" : "nl-email";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ status: "loading", message: "" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), website: form.get("website"), source: where, alerts: alertsOption && form.get("alerts") === "on" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) track("newsletter_signup", { source: where, alerts_interest: alertsOption && form.get("alerts") === "on" });
      setState({
        status: res.ok && data.ok ? "done" : "error",
        message: data.message ?? "Something went wrong. Please try again later.",
      });
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" aria-label="Newsletter signup">
      {!compact && (
        <div>
          <p className="font-medium tracking-[-0.02em]">Get the MCP Risk Radar by email</p>
          <p className="text-sm text-muted-foreground">A short note when something changes: new advisories, projects that go quiet and ranking changes. Confirm by email, unsubscribe any time.</p>
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={id} className="sr-only">Email address</label>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={busy}
          className="h-11 w-full min-w-0 shrink-0 rounded-full sm:w-auto sm:flex-1 bg-ink/[0.06] px-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:bg-ink/[0.09] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        {/* Honeypot: invisible para personas; los bots lo rellenan. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="edge-btn edge-primary h-11 shrink-0 rounded-full px-6 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {state.status === "loading" ? "Sending..." : "Subscribe"}
        </button>
      </div>
      {alertsOption && (
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="alerts" disabled={busy} className="mt-1" />
          <span>I would also want an alert for the servers in my own configuration. We have not built per-server alerts yet; this only tells us whether to.</span>
        </label>
      )}
      <p
        role="status"
        aria-live="polite"
        className={`min-h-5 text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
      >
        {state.message}
      </p>
      <p className="text-xs text-muted-foreground">
        See the <a href="/privacy" className="underline underline-offset-4 hover:text-foreground">privacy notice</a>.
      </p>
    </form>
  );
}
