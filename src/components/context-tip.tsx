"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { playSound } from "@/lib/sfx";
import { TIPS } from "@/lib/tips";

type Frame = { text: string; at: number; grow: boolean };

const CHAR_MS = 26; // ritmo base por carácter
const PAUSE_EXTRA_MS = 12; // pausa extra tras espacio o punto
const TYPO_HOLD_MS = 48; // cuánto "se nota" el error antes de borrarlo
const TYPO_CHANCE = 0.09;
const LINGER_MS = 2600; // tiempo visible tras terminar de escribir
const EDGE = 12;
const TYPO_POOL = "abcdefghijklmnopqrstuvwxyz0123456789#@$";

// Elementos donde se conserva el menú nativo del navegador.
const NATIVE_MENU = "input, textarea, select, [contenteditable='true'], a[href], [data-native-menu]";

function buildTimeline(text: string): Frame[] {
  const frames: Frame[] = [{ text: "", at: 0, grow: false }];
  let typed = "";
  let t = 0;
  for (const ch of text) {
    if (ch !== " " && Math.random() < TYPO_CHANCE) {
      const wrong = TYPO_POOL[Math.floor(Math.random() * TYPO_POOL.length)];
      t += CHAR_MS;
      frames.push({ text: typed + wrong, at: t, grow: true });
      t += TYPO_HOLD_MS;
      frames.push({ text: typed, at: t, grow: false });
      t += CHAR_MS;
    }
    typed += ch;
    t += CHAR_MS + (ch === " " || ch === "." ? PAUSE_EXTRA_MS : 0);
    frames.push({ text: typed, at: t, grow: true });
  }
  return frames;
}

// Bolsa aleatoria: recorre todas las frases antes de repetir y nunca repite la última mostrada.
function makeBag(last?: string): string[] {
  const bag = [...TIPS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  if (last && bag[bag.length - 1] === last && bag.length > 1) {
    [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
  }
  return bag;
}

type Tip = { x: number; y: number; key: number; full: string; text: string; done: boolean };

export function ContextTip() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const bag = useRef<string[]>([]);
  const last = useRef<string | undefined>(undefined);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setTip(null);
    setPos(null);
  }, [clearTimers]);

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(NATIVE_MENU)) return;
      if (window.getSelection()?.toString()) return; // texto seleccionado: menú nativo para copiar

      e.preventDefault();
      clearTimers();

      if (bag.current.length === 0) bag.current = makeBag(last.current);
      const full = bag.current.pop()!;
      last.current = full;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const key = Date.now();
      const frames = reduced ? [{ text: full, at: 0, grow: false }] : buildTimeline(full);
      playSound("info");
      setPos(null);
      setTip({ x: e.clientX, y: e.clientY, key, full, text: frames[0].text, done: reduced });

      for (const f of frames.slice(1)) {
        timers.current.push(
          window.setTimeout(() => {
            if (f.grow) playSound("typing");
            setTip((cur) => (cur && cur.key === key ? { ...cur, text: f.text, done: f.text === full } : cur));
          }, f.at),
        );
      }
      const end = frames[frames.length - 1].at;
      timers.current.push(window.setTimeout(close, end + LINGER_MS));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("contextmenu", onContext, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", close, true);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    return () => {
      clearTimers();
      document.removeEventListener("contextmenu", onContext, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", close, true);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [clearTimers, close]);

  // Coloca la caja con su tamaño final (reservado por el texto fantasma): sin salirse del viewport.
  useLayoutEffect(() => {
    if (!tip || !boxRef.current) return;
    const { width, height } = boxRef.current.getBoundingClientRect();
    const half = width / 2;
    const left = Math.min(Math.max(tip.x, half + EDGE), window.innerWidth - half - EDGE);
    const below = tip.y - height - 16 < EDGE;
    setPos({ left, top: tip.y, below });
  }, [tip?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tip) return null;

  return (
    <div
      ref={boxRef}
      role="status"
      aria-live="polite"
      aria-label={tip.done ? tip.full : undefined}
      className={`context-tip${tip.done ? " is-typed" : " is-typing"}${pos?.below ? " is-below" : ""}`}
      style={{ left: pos?.left ?? tip.x, top: pos?.top ?? tip.y, visibility: pos ? "visible" : "hidden" }}
    >
      <span className="context-tip-prompt" aria-hidden="true">› </span>
      <span className="context-tip-body">
        {/* El fantasma fija el tamaño final para que la caja no crezca mientras se escribe. */}
        <span className="context-tip-ghost" aria-hidden="true">{tip.full}</span>
        <span className="context-tip-text" aria-hidden="true">
          {tip.text}
          <span className="context-tip-caret">█</span>
        </span>
      </span>
    </div>
  );
}
