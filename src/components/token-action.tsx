"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Acción explícita con botón: evita que los escáneres de enlaces del correo confirmen o den de baja solos.
export function TokenAction({ endpoint, token, label }: { endpoint: string; token: string; label: string }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; message: string }>({
    status: "idle",
    message: "",
  });

  async function run() {
    setState({ status: "loading", message: "" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      setState({ status: res.ok && data.ok ? "done" : "error", message: data.message ?? "Something went wrong." });
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }

  return (
    <div className="space-y-3">
      {state.status !== "done" && (
        <Button className="edge-btn edge-primary" onClick={run} disabled={state.status === "loading" || !token}>
          {state.status === "loading" ? "Working..." : label}
        </Button>
      )}
      <p role="status" aria-live="polite" className={state.status === "error" ? "text-destructive" : ""}>
        {state.message}
      </p>
    </div>
  );
}
