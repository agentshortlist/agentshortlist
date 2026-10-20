"use client";

import { useState } from "react";

// Copia la dirección del artículo. Con el portapapeles bloqueado, selecciona el texto en un campo temporal como respaldo.
export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("done");
    } catch {
      try {
        const t = document.createElement("textarea");
        t.value = url;
        t.setAttribute("readonly", "");
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(t);
        setState(ok ? "done" : "fail");
      } catch {
        setState("fail");
      }
    }
    window.setTimeout(() => setState("idle"), 2200);
  };
  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{state === "done" ? "Link copied" : state === "fail" ? "Copy failed" : "Copy link"}</span>
    </button>
  );
}
