"use client";

import { useEffect, useRef, useState } from "react";

const PHRASE = "Ranked by real signals";
const TYPE_MS = 42;
const FILL_MS = 1500;
const KEY = "agentshortlist:intro";

// Pantalla de apertura: solo en la home y solo la primera vez de cada sesión. El script del <head> pone la clase "intro"
// en <html> antes de pintar; sin esa clase (sin JavaScript, bots, reducir movimiento, otras páginas) no se ve nunca.
export function IntroScreen({ tools, rankings }: { tools: number; rankings: number }) {
  const [typed, setTyped] = useState("");
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro")) return;
    const timers: number[] = [];
    let raf = 0;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      setPct(100);
      setOut(true);
      window.setTimeout(() => {
        root.classList.remove("intro");
        window.dispatchEvent(new Event("agentshortlist-intro-done"));
      }, 420);
    };

    // Escribe la frase letra a letra.
    for (let i = 1; i <= PHRASE.length; i++) timers.push(window.setTimeout(() => setTyped(PHRASE.slice(0, i)), 200 + i * TYPE_MS));

    // Contador y línea de progreso con curva suave.
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / FILL_MS);
      setPct(Math.round((1 - Math.pow(1 - p, 2.4)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else timers.push(window.setTimeout(finish, 260));
    };
    raf = requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => { if (["Escape", "Enter", " "].includes(e.key)) finish(); };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className={`intro-screen${out ? " intro-out" : ""}`}
      role="status"
      aria-label="Loading AgentShortlist"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
    >
      <p className="intro-phrase" aria-hidden="true">
        {typed}
        <span className="intro-caret" />
      </p>
      <div className="intro-foot">
        <span>AgentShortlist, {tools} tools, {rankings} rankings</span>
        <button
          type="button"
          className="intro-skip"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          }}
        >
          Skip
        </button>
        <span className="mono-num">{String(pct).padStart(3, "0")}%</span>
      </div>
      <i className="intro-bar" style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
