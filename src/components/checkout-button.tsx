"use client";

import { useState } from "react";

export function CheckoutButton({ product, label, disabled = false }: { product: "featured" | "newsletter"; label: string; disabled?: boolean }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; message: string }>({ status: "idle", message: "" });

  async function go() {
    setState({ status: "loading", message: "" });
    try {
      const res = await fetch("/api/sponsor/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; url?: string; message?: string };
      if (res.ok && data.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setState({ status: "error", message: data.message ?? "Could not start checkout." });
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={go}
        disabled={disabled || state.status === "loading"}
        className="edge-btn edge-primary h-11 rounded-full px-6 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state.status === "loading" ? "Opening checkout..." : label}
      </button>
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>
        {state.message}
      </p>
    </div>
  );
}
