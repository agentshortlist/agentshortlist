"use client";

import { useEffect } from "react";
import { playSound, soundPlayCount, unlockSound, type Cue } from "@/lib/sfx";

// Sonidos globales por delegación de eventos. Atributos para ajustar un elemento:
//   data-sfx="off"     sin sonido (ni el elemento ni sus hijos)
//   data-sfx="manual"  el propio componente reproduce su cue
const INTERACTIVE =
  "a[href], button, summary, [role='button'], [role='tab'], [role='option'], [role='menuitem'], [role='switch'], [role='checkbox'], [data-sfx]";
const HOVER_GROUP = ".nav-item, [data-fluid], .surface-hover";
const TEXT_FIELD = "input, textarea, select, [contenteditable='true']";

const interactive = (t: EventTarget | null) => {
  const el = t instanceof Element ? t.closest(INTERACTIVE) : null;
  if (!el || el.closest("[inert], [data-sfx='off']") || el.matches(":disabled, [aria-disabled='true']")) return null;
  return el;
};

export function SoundProvider() {
  useEffect(() => {
    let keyboard = false;
    let lastHover = 0;
    const opt = { capture: true } as const;

    const unlock = () => unlockSound();
    const onKey = (e: KeyboardEvent) => {
      unlockSound();
      if (e.key === "Tab" || e.key.startsWith("Arrow")) keyboard = true;
    };
    const onDown = () => {
      keyboard = false;
      unlockSound();
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const el = e.target instanceof Element ? e.target.closest(HOVER_GROUP) : null;
      if (!el || el.closest("[inert], [data-sfx='off']")) return;
      const from = e.relatedTarget instanceof Element ? e.relatedTarget.closest(HOVER_GROUP) : null;
      if (el === from) return;
      const now = performance.now();
      if (now - lastHover < 70) return;
      lastHover = now;
      playSound("hover");
    };
    const onFocus = (e: FocusEvent) => {
      if (keyboard && interactive(e.target)) playSound("focus");
    };
    const onClick = (e: MouseEvent) => {
      const el = interactive(e.target);
      if (!el || el.closest("[data-sfx='manual']") || el.matches(TEXT_FIELD)) return;
      const before = soundPlayCount();
      // Espera un fotograma: si el propio componente ya reprodujo un cue, no se duplica.
      requestAnimationFrame(() => {
        if (soundPlayCount() !== before) return;
        let cue: Cue = "press";
        if (el.hasAttribute("aria-expanded")) cue = el.getAttribute("aria-expanded") === "true" ? "open" : "close";
        else if (el.getAttribute("role") === "switch" || el.hasAttribute("aria-pressed")) {
          cue = (el.getAttribute("aria-checked") ?? el.getAttribute("aria-pressed")) === "true" ? "toggle-on" : "toggle-off";
        } else if (el.matches("a[href], [role='tab'], [role='option'], [role='menuitem']")) cue = "select";
        playSound(cue);
      });
    };
    const onInput = (e: Event) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement)) return;
      if (t instanceof HTMLInputElement && !["text", "search", "email", "url", "tel", "number"].includes(t.type)) return;
      if (t.closest("[data-sfx='off']")) return;
      if (e instanceof InputEvent && e.isComposing) return;
      playSound("typing");
    };
    const onInvalid = () => playSound("error");

    document.addEventListener("pointerdown", onDown, opt);
    document.addEventListener("keydown", onKey, opt);
    document.addEventListener("pointerover", onOver, opt);
    document.addEventListener("focusin", onFocus, opt);
    document.addEventListener("click", onClick, opt);
    document.addEventListener("input", onInput, opt);
    document.addEventListener("invalid", onInvalid, opt);
    window.addEventListener("touchstart", unlock, { passive: true, once: true });
    return () => {
      document.removeEventListener("pointerdown", onDown, opt);
      document.removeEventListener("keydown", onKey, opt);
      document.removeEventListener("pointerover", onOver, opt);
      document.removeEventListener("focusin", onFocus, opt);
      document.removeEventListener("click", onClick, opt);
      document.removeEventListener("input", onInput, opt);
      document.removeEventListener("invalid", onInvalid, opt);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);
  return null;
}
