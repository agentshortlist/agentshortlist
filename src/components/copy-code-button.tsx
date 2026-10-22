"use client";

import { useState } from "react";
import { track } from "@/lib/track";

// Copia un fragmento de configuración tomado de la documentación del proyecto.
export function CopyCodeButton({ code, slug }: { code: string; slug: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState("done");
      track("snippet_copy", { server: slug });
    } catch {
      setState("fail");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };
  return (
    <button type="button" onClick={copy} className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:bg-ink/5" aria-live="polite">
      {state === "done" ? "Copied" : state === "fail" ? "Copy failed" : "Copy"}
    </button>
  );
}
