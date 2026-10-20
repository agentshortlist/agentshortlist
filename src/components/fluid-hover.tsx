"use client";

import { useEffect, useRef } from "react";

// Placa única que se desliza y se redimensiona hacia el elemento bajo el puntero con un muelle físico.
// Solo con ratón fino; con reduce-motion salta sin animar. También sigue el foco de teclado.
const SPRING = { stiffness: 680, damping: 52, mass: 1 }; // preset "rápido"
const MAX_DT = 0.032;

type Box = { x: number; y: number; w: number; h: number };
type Axis = "x" | "y" | "xy";

function step(pos: number, vel: number, target: number, dt: number) {
  const a = ((target - pos) * SPRING.stiffness - vel * SPRING.damping) / SPRING.mass;
  const v = vel + a * dt;
  return { pos: pos + v * dt, vel: v };
}

export function FluidHover({
  itemSelector,
  axis = "x",
  className = "",
  children,
  ...rest
}: {
  itemSelector: string;
  axis?: Axis;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const plate = plateRef.current;
    if (!root || !plate) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const cur = { x: 0, y: 0, w: 0, h: 0, vx: 0, vy: 0, vw: 0, vh: 0 };
    let target: Box | null = null;
    let raf = 0;
    let last = 0;
    let first = true;
    let pointerInside = false;
    let pointer: { x: number; y: number } | null = null;

    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const rb = root.getBoundingClientRect();
      const items = [...root.querySelectorAll<HTMLElement>(itemSelector)];
      const boxes = items.map((el) => {
        const b = el.getBoundingClientRect();
        return { x: b.left - rb.left, y: b.top - rb.top, w: b.width, h: b.height };
      });
      return { rb, items, boxes };
    };

    const paint = () => {
      plate.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      plate.style.width = `${cur.w}px`;
      plate.style.height = `${cur.h}px`;
    };

    const snap = (b: Box) => {
      Object.assign(cur, { x: b.x, y: b.y, w: b.w, h: b.h, vx: 0, vy: 0, vw: 0, vh: 0 });
      paint();
    };

    const hide = () => {
      target = null;
      plate.classList.remove("is-on");
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      first = true;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!target) return;
      const dt = last === 0 ? 1 / 60 : Math.min((now - last) / 1000, MAX_DT);
      last = now;
      const sx = step(cur.x, cur.vx, target.x, dt);
      const sy = step(cur.y, cur.vy, target.y, dt);
      const sw = step(cur.w, cur.vw, target.w, dt);
      const sh = step(cur.h, cur.vh, target.h, dt);
      Object.assign(cur, { x: sx.pos, vx: sx.vel, y: sy.pos, vy: sy.vel, w: sw.pos, vw: sw.vel, h: sh.pos, vh: sh.vel });
      paint();
      const settled =
        Math.abs(cur.x - target.x) < 0.35 && Math.abs(cur.vx) < 8 &&
        Math.abs(cur.y - target.y) < 0.35 && Math.abs(cur.vy) < 8 &&
        Math.abs(cur.w - target.w) < 0.35 && Math.abs(cur.vw) < 8 &&
        Math.abs(cur.h - target.h) < 0.35 && Math.abs(cur.vh) < 8;
      if (!settled) raf = requestAnimationFrame(tick);
    };

    const moveTo = (b: Box) => {
      target = b;
      plate.classList.add("is-on");
      if (first || reduced()) {
        snap(b);
        first = false;
        return;
      }
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const nearest = (p: { x: number; y: number }, boxes: Box[]) => {
      let best = -1;
      let bestD = Infinity;
      boxes.forEach((b, i) => {
        if (b.w <= 0 || b.h <= 0) return;
        const inside = p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const d = inside ? -1 : axis === "xy" ? Math.hypot(p.x - cx, p.y - cy) : Math.abs(axis === "x" ? p.x - cx : p.y - cy);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };

    const onEnter = () => {
      pointerInside = true;
      first = true;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointerInside = true;
      const { rb, boxes } = measure();
      pointer = { x: e.clientX - rb.left, y: e.clientY - rb.top };
      const i = nearest(pointer, boxes);
      if (i < 0) return hide();
      moveTo(boxes[i]);
    };
    const onLeave = () => {
      pointerInside = false;
      pointer = null;
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.contains(active) && active.matches(itemSelector)) {
        const { rb } = measure();
        const b = active.getBoundingClientRect();
        moveTo({ x: b.left - rb.left, y: b.top - rb.top, w: b.width, h: b.height });
        return;
      }
      hide();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (pointerInside) return;
      const el = e.target instanceof HTMLElement ? (e.target.matches(itemSelector) ? e.target : e.target.closest<HTMLElement>(itemSelector)) : null;
      if (!el || !root.contains(el)) return;
      const { rb } = measure();
      const b = el.getBoundingClientRect();
      first = true;
      moveTo({ x: b.left - rb.left, y: b.top - rb.top, w: b.width, h: b.height });
    };
    const onFocusOut = (e: FocusEvent) => {
      if (pointerInside) return;
      const next = e.relatedTarget;
      if (next instanceof Node && root.contains(next)) return;
      hide();
    };
    const ro = new ResizeObserver(() => {
      if (!pointer) return;
      const { boxes } = measure();
      const i = nearest(pointer, boxes);
      if (i >= 0) moveTo(boxes[i]);
    });
    ro.observe(root);

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      hide();
      ro.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
    };
  }, [itemSelector, axis]);

  return (
    <div ref={rootRef} className={`fluid-hover ${className}`} {...rest}>
      {children}
      <span ref={plateRef} className="fluid-plate" aria-hidden="true" />
    </div>
  );
}
