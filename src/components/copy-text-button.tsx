"use client";

import { useState } from "react";
import { track } from "@/lib/track";

// Copia un texto generado al pulsar (enlace actual, informe en Markdown…). Con el portapapeles bloqueado avisa en vez de fallar en silencio.
export function CopyTextButton({ text, label, doneLabel, event, className }: { text: string | (() => string); label: string; doneLabel?: string; event?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(typeof text === "function" ? text() : text);
      setState("done");
      if (event) track(event);
    } catch {
      setState("fail");
    }
    window.setTimeout(() => setState("idle"), 2200);
  };
  return (
    <button type="button" onClick={copy} className={className ?? "rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5"}>
      <span aria-live="polite">{state === "done" ? (doneLabel ?? "Copied") : state === "fail" ? "Copy failed" : label}</span>
    </button>
  );
}
