"use client";

import { useEffect, useRef, useState } from "react";

// Cursor-listón: un rastro afilado que sigue al puntero y sustituye al cursor del sistema.
// Blanco por defecto, azul de acento sobre elementos interactivos, cabeza más grande al pulsar.
// Solo con ratón fino y sin reduce-motion. En campos de texto se conserva el cursor nativo.
const LENGTH = 26;
const WIDTH = 4;
const SMOOTH = 0.28;
const ALPHA = 0.85;
const INTERACTIVE = "a[href], button, [role='button'], summary, label, input, textarea, select";
const TEXT_FIELD = "input:not([type='button']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";
// Tinta y acento por tema (aproximación sRGB del acento oklch del CSS).
const THEMES = {
  dark: { ink: [245, 245, 245], signal: [138, 155, 240] },
  light: { ink: [18, 18, 18], signal: [48, 76, 200] },
} as const;

type P = { x: number; y: number };

export function CursorRibbon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !calm.matches);
    update();
    fine.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const root = document.documentElement;
    const trail: P[] = [];
    let mx = 0;
    let my = 0;
    let active = false;
    let overInteractive = 0; // 0..1 suavizado
    let hot = false;
    let pressed = 0; // 0..1 suavizado
    let isDown = false;
    let overField = false;
    let lastMove = 0;
    let w = 1;
    let h = 1;
    let raf = 0;
    let hidden = document.visibilityState === "hidden";
    let tx = 0.0;
    let ty = 1.0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      // Tamaño real del canvas en pantalla: con barras de scroll visibles, innerWidth es mayor que
      // el ancho fijo disponible y el dibujo quedaría desplazado respecto al puntero.
      const box = canvas.getBoundingClientRect();
      w = Math.max(1, box.width);
      h = Math.max(1, box.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const mix = (k: number) => {
      const th = root.classList.contains("light") ? THEMES.light : THEMES.dark;
      const r = th.ink[0] + (th.signal[0] - th.ink[0]) * k;
      const g = th.ink[1] + (th.signal[1] - th.ink[1]) * k;
      const b = th.ink[2] + (th.signal[2] - th.ink[2]) * k;
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${ALPHA})`;
    };

    const schedule = () => {
      if (!raf && !hidden) raf = requestAnimationFrame(frame);
    };

    const frame = (now: number) => {
      raf = 0;
      if (hidden) return;

      if (active && !overField) {
        const last = trail[trail.length - 1];
        const moved = last ? Math.hypot(mx - last.x, my - last.y) : 99;
        if (!last || moved > 0.35) {
          trail.push({ x: mx, y: my });
          if (trail.length > LENGTH) trail.shift();
        } else {
          last.x = mx;
          last.y = my;
        }
        if (trail.length > 2 && now - lastMove > 28) trail.shift(); // en reposo, la cola se recoge
        const head = trail[trail.length - 1];
        if (head) {
          head.x = mx;
          head.y = my;
        }
        for (let i = trail.length - 2; i >= 0; i--) {
          trail[i].x += (trail[i + 1].x - trail[i].x) * SMOOTH * 0.22;
          trail[i].y += (trail[i + 1].y - trail[i].y) * SMOOTH * 0.22;
        }
        overInteractive += ((hot ? 1 : 0) - overInteractive) * 0.28;
        pressed += ((isDown ? 1 : 0) - pressed) * 0.38;
      }

      ctx.clearRect(0, 0, w, h);

      if (active && !overField && trail.length > 0) {
        const k = overInteractive;
        ctx.fillStyle = mix(k);

        if (trail.length >= 3) {
          const left: [number, number][] = [];
          const right: [number, number][] = [];
          for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1];
            const b = trail[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            let nx: number;
            let ny: number;
            if (len < 0.45) {
              nx = -tx;
              ny = ty;
            } else {
              nx = -dy / len;
              ny = dx / len;
              tx = dx / len;
              ty = dy / len;
            }
            const f = i / (trail.length - 1);
            const half = f * f * WIDTH * 0.5;
            left.push([b.x + nx * half, b.y + ny * half]);
            right.push([b.x - nx * half, b.y - ny * half]);
          }
          const first = left[0];
          if (first) {
            ctx.beginPath();
            ctx.moveTo(first[0], first[1]);
            for (let i = 1; i < left.length; i++) ctx.lineTo(left[i][0], left[i][1]);
            for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(1.15, WIDTH * 0.48) * (1 + pressed * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      const alive = (active && !overField) || overInteractive > 0.012 || pressed > 0.012;
      if (alive) schedule();
      else ctx.clearRect(0, 0, w, h);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      const el = e.target instanceof Element ? e.target : null;
      overField = !!el?.closest(TEXT_FIELD);
      const it = el?.closest(INTERACTIVE) ?? null;
      hot = !!it && !it.matches(":disabled, [aria-disabled='true']") && !overField;
      if (!active) {
        active = true;
        trail.length = 0;
        trail.push({ x: mx, y: my });
        root.classList.add("has-ribbon");
      }
      schedule();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button === 0) isDown = true;
    };
    const onUp = () => {
      isDown = false;
    };
    const onLeave = (e: PointerEvent | MouseEvent) => {
      if ((e as MouseEvent).relatedTarget) return;
      active = false;
      hot = false;
      isDown = false;
      trail.length = 0;
      root.classList.remove("has-ribbon");
      ctx.clearRect(0, 0, w, h);
    };
    const onVisibility = () => {
      hidden = document.visibilityState === "hidden";
      if (hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        ctx.clearRect(0, 0, w, h);
      } else {
        schedule();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("has-ribbon");
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="ribbon-layer" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
