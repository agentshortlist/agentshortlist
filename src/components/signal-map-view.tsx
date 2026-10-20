"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

export type MapPoint = {
  slug: string;
  name: string;
  category: string;
  catName: string;
  stars: number;
  days: number;
  score: number;
  license: string | null;
  lastPush: string;
};

type Cat = { slug: string; name: string };

const HUES: Record<string, number> = {
  "coding-agents": 255,
  "mcp-servers": 165,
  "mcp-database-servers": 205,
  "multi-agent-frameworks": 305,
  "agent-frameworks": 345,
  "research-agents": 85,
  "browser-agents": 30,
  "ops-agents": 130,
  "personal-agents": 55,
};
const hue = (c: string) => HUES[c] ?? 250;

const fmt = (n: number) => n.toLocaleString("en-US");
const short = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k`.replace(".0k", "k") : String(n));
const ago = (d: number) => (d < 1 ? "today" : d < 2 ? "1 day ago" : `${Math.round(d)} days ago`);
const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const PAD = { l: 44, r: 16, t: 14, b: 40 };

export function SignalMapView({ points, cats }: { points: MapPoint[]; cats: Cat[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  const [active, setActive] = useState<string | null>(null); // categoría filtrada
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null); // herramienta seleccionada o bajo el puntero

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(el);
    setWidth(Math.max(280, Math.floor(el.getBoundingClientRect().width)));
    return () => ro.disconnect();
  }, []);

  const small = width < 520;
  const H = small ? 420 : 430;

  const model = useMemo(() => {
    const minLog = Math.log10(Math.min(...points.map((p) => p.stars)) * 0.8);
    const maxLog = Math.log10(Math.max(...points.map((p) => p.stars)) * 1.18);
    return { minLog, maxLog, mStars: median(points.map((p) => p.stars)), mDays: median(points.map((p) => p.days)) };
  }, [points]);

  const x = (stars: number) => PAD.l + ((Math.log10(stars) - model.minLog) / (model.maxLog - model.minLog)) * (width - PAD.l - PAD.r);
  // Escala logarítmica: casi todo el catálogo se actualizó hace pocos días y así los puntos no se apilan en una línea.
  const y = (days: number) => PAD.t + (Math.log1p(Math.min(days, 90)) / Math.log1p(90)) * (H - PAD.t - PAD.b);
  const radius = (score: number) => (small ? 2.6 : 3) + (Math.max(0, score) / 100) * (small ? 2.4 : 3.2);

  const q = query.trim().toLowerCase();
  const matches = (p: MapPoint) => (!active || p.category === active) && (!q || p.name.toLowerCase().includes(q));
  const visible = points.filter(matches);
  const pickedPt = points.find((p) => p.slug === picked) ?? null;

  const ticksX = [1_000, 10_000, 100_000].filter((t) => Math.log10(t) > model.minLog && Math.log10(t) < model.maxLog);
  const ticksY: [number, string][] = [[0, "today"], [3, "3 d"], [7, "7 d"], [30, "30 d"], [90, "90 d"]];

  // Con 149 puntos muchos caen en el mismo sitio. Los separamos un poco (máximo 8 px) para que ninguno tape a otro;
  // el dato exacto de cada herramienta está siempre en su ficha al pasar el puntero o tocar.
  const pos = useMemo(() => {
    const n = points.length;
    const ox = points.map((p) => x(p.stars));
    const oy = points.map((p) => y(p.days));
    const r = points.map((p) => radius(p.score));
    const px = ox.slice(), py = oy.slice();
    const MAXD = 8;
    for (let it = 0; it < 70; it++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          let dx = px[j] - px[i], dy = py[j] - py[i];
          let d = Math.hypot(dx, dy);
          const min = r[i] + r[j] + 1.4;
          if (d >= min) continue;
          if (d < 0.01) { dx = Math.cos(i * 2.4 + j); dy = Math.sin(i * 2.4 + j); d = 1; }
          const push = (min - d) / 2;
          px[i] -= (dx / d) * push; py[i] -= (dy / d) * push;
          px[j] += (dx / d) * push; py[j] += (dy / d) * push;
        }
      }
      for (let i = 0; i < n; i++) {
        // Vuelven hacia su posición real y nunca se alejan más de MAXD.
        px[i] += (ox[i] - px[i]) * 0.04; py[i] += (oy[i] - py[i]) * 0.04;
        const ddx = px[i] - ox[i], ddy = py[i] - oy[i], dd = Math.hypot(ddx, ddy);
        if (dd > MAXD) { px[i] = ox[i] + (ddx / dd) * MAXD; py[i] = oy[i] + (ddy / dd) * MAXD; }
        px[i] = Math.min(Math.max(px[i], PAD.l + r[i]), width - PAD.r - r[i]);
        py[i] = Math.min(Math.max(py[i], PAD.t), H - PAD.b);
      }
    }
    const m = new Map<string, { x: number; y: number; r: number }>();
    // Redondeo: Math.hypot/sin/cos pueden diferir en la última cifra entre servidor y navegador y provocaría un aviso de hidratación.
    const rd = (n: number) => Math.round(n * 100) / 100;
    points.forEach((p, i) => m.set(p.slug, { x: rd(px[i]), y: rd(py[i]), r: rd(r[i]) }));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, width, H, small, model]);

  // Los 15 con más puntuación destacan; el resto queda como contexto, más tenue.
  const topSet = useMemo(() => new Set([...points].sort((a, b) => b.score - a.score || b.stars - a.stars).slice(0, 15).map((p) => p.slug)), [points]);
  const filtering = active !== null || q !== "";

  // Etiquetas: solo las más puntuadas, en un hueco libre (ni sobre otros puntos ni sobre otras etiquetas).
  const labels = useMemo(() => {
    const out: { p: MapPoint; tx: number; ty: number; anchor: "start" | "end" | "middle" }[] = [];
    const boxes: [number, number, number, number][] = [];
    const max = small ? 3 : 7;
    const dots = visible.map((p) => pos.get(p.slug)!).filter(Boolean);
    const hitsDot = (b: [number, number, number, number], self: { x: number; y: number }) =>
      dots.some((d) => d !== self && d.x + d.r + 2 > b[0] && d.x - d.r - 2 < b[2] && d.y + d.r + 2 > b[1] && d.y - d.r - 2 < b[3]);
    for (const p of [...visible].sort((a, b) => b.score - a.score || b.stars - a.stars)) {
      if (out.length >= max) break;
      const c = pos.get(p.slug);
      if (!c) continue;
      const w = p.name.length * 6.6, h = 14, g = c.r + 5;
      const cands: { anchor: "start" | "end" | "middle"; tx: number; ty: number; box: [number, number, number, number] }[] = [
        { anchor: "start", tx: c.x + g, ty: c.y + 4, box: [c.x + g, c.y - 8, c.x + g + w, c.y + 8] },
        { anchor: "end", tx: c.x - g, ty: c.y + 4, box: [c.x - g - w, c.y - 8, c.x - g, c.y + 8] },
        { anchor: "middle", tx: c.x, ty: c.y - g - 2, box: [c.x - w / 2, c.y - g - h, c.x + w / 2, c.y - g + 2] },
        { anchor: "middle", tx: c.x, ty: c.y + g + 10, box: [c.x - w / 2, c.y + g - 2, c.x + w / 2, c.y + g + h] },
      ];
      for (const k of cands) {
        const inside = k.box[0] > PAD.l - 2 && k.box[2] < width - 4 && k.box[1] > 2 && k.box[3] < H - PAD.b + 2;
        const clash = boxes.some((b) => k.box[0] < b[2] && k.box[2] > b[0] && k.box[1] < b[3] && k.box[3] > b[1]);
        if (inside && !clash && !hitsDot(k.box, c)) {
          boxes.push(k.box);
          out.push({ p, tx: k.tx, ty: k.ty, anchor: k.anchor });
          break;
        }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.length, active, q, width, small, pos]);

  const topStar = [...points].sort((a, b) => b.stars - a.stars)[0];
  const quietest = [...points].sort((a, b) => b.days - a.days)[0];
  const recent = points.filter((p) => p.days <= 7).length;

  return (
    <figure className="signal-map surface-lg space-y-4 p-4 sm:p-6">
      <figcaption className="prose-measure text-sm text-muted-foreground">
        {recent} of {points.length} tools were updated in the last week. The 15 highest GitHub-signal scores stand out; the score here uses one reference across all tools, so it differs from category rankings. Color shows the category and bigger dots mean a higher score.
      </figcaption>

      <div className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by category">
        <button type="button" className="map-chip shrink-0" aria-pressed={active === null} onClick={() => setActive(null)}>
          All <span className="mono-num text-muted-foreground">{points.length}</span>
        </button>
        {cats.map((c) => {
          const n = points.filter((p) => p.category === c.slug).length;
          if (!n) return null;
          return (
            <button key={c.slug} type="button" className="map-chip shrink-0 whitespace-nowrap" aria-pressed={active === c.slug} onClick={() => setActive(active === c.slug ? null : c.slug)}>
              <i className="map-swatch" style={{ ["--h" as string]: hue(c.slug) }} aria-hidden="true" />
              {c.name} <span className="mono-num text-muted-foreground">{n}</span>
            </button>
          );
        })}
        <label className="sr-only" htmlFor="map-find">Find a tool on the map</label>
        <input
          id="map-find"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            const m = points.filter((p) => e.target.value.trim() && p.name.toLowerCase().includes(e.target.value.trim().toLowerCase()));
            setPicked(m.length === 1 ? m[0].slug : null);
          }}
          placeholder="Find a tool"
          autoComplete="off"
          className="h-9 w-40 shrink-0 rounded-full bg-ink/[0.06] px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:ml-auto"
        />
      </div>

      <div ref={wrap} className="w-full">
        <svg
          width={width}
          height={H}
          viewBox={`0 0 ${width} ${H}`}
          role="group"
          aria-label={`Map of ${points.length} tools by GitHub stars and days since last push`}
          className="block"
        >
          {ticksY.map(([d, label]) => (
            <g key={d}>
              <line x1={PAD.l} x2={width - PAD.r} y1={y(d)} y2={y(d)} className="map-grid" />
              <text x={PAD.l - 8} y={y(d) + 4} textAnchor="end" className="map-tick">{label}</text>
            </g>
          ))}
          {ticksX.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={PAD.t} y2={H - PAD.b} className="map-grid" />
              <text x={x(t)} y={H - PAD.b + 16} textAnchor="middle" className="map-tick">{short(t)}</text>
            </g>
          ))}
          <text x={(PAD.l + width - PAD.r) / 2} y={H - 6} textAnchor="middle" className="map-axis">GitHub stars, log scale</text>
          <text transform={`translate(12 ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" className="map-axis">Last push</text>

          {/* Medianas: separan lo habitual de lo excepcional */}
          <line x1={x(model.mStars)} x2={x(model.mStars)} y1={PAD.t} y2={H - PAD.b} className="map-median" />
          <line x1={PAD.l} x2={width - PAD.r} y1={y(model.mDays)} y2={y(model.mDays)} className="map-median" />
          <text x={x(model.mStars) + 5} y={H - PAD.b - 6} className="map-note">median {short(Math.round(model.mStars))}</text>
          <text x={PAD.l + 6} y={y(model.mDays) + 14} className="map-note">median {model.mDays.toFixed(1)} d</text>

          {points.map((p) => {
            const on = matches(p);
            const sel = p.slug === picked;
            const c = pos.get(p.slug)!;
            const op = !on ? 0.08 : filtering || topSet.has(p.slug) || sel ? 1 : 0.48;
            return (
              <Link
                key={p.slug}
                href={`/agents/${p.slug}`}
                tabIndex={on ? 0 : -1}
                aria-label={`${p.name}, ${fmt(p.stars)} stars, pushed ${ago(p.days)}, score ${p.score}`}
                onMouseEnter={() => on && setPicked(p.slug)}
                onFocus={() => setPicked(p.slug)}
                onClick={(e) => {
                  // En pantallas táctiles el primer toque muestra la ficha; el segundo abre la página.
                  if (window.matchMedia("(hover: none)").matches && picked !== p.slug) {
                    e.preventDefault();
                    setPicked(p.slug);
                  }
                }}
                style={{ pointerEvents: on ? "auto" : "none" }}
              >
                <circle cx={c.x} cy={c.y} r={Math.max(c.r + 4, 10)} fill="transparent" />
                {sel && <circle cx={c.x} cy={c.y} r={c.r + 5} className="map-ring" style={{ ["--h" as string]: hue(p.category) }} />}
                <circle cx={c.x} cy={c.y} r={c.r} className="map-dot" style={{ ["--h" as string]: hue(p.category), opacity: op }} />
              </Link>
            );
          })}

          {labels.map(({ p, tx, ty, anchor }) => (
            <text key={p.slug} x={tx} y={ty} textAnchor={anchor} className="map-label pointer-events-none" style={{ opacity: picked && picked !== p.slug ? 0.35 : 1 }}>
              {p.name}
            </text>
          ))}
          {pickedPt && matches(pickedPt) && !labels.some((l) => l.p.slug === pickedPt.slug) && (() => {
            const c = pos.get(pickedPt.slug)!;
            const right = c.x < width / 2;
            return (
              <text x={right ? c.x + c.r + 6 : c.x - c.r - 6} y={c.y + 4} textAnchor={right ? "start" : "end"} className="map-label pointer-events-none">
                {pickedPt.name}
              </text>
            );
          })()}
        </svg>
      </div>

      <div className="min-h-[3.75rem] border-t border-ink/[0.09] pt-4 text-sm" aria-live="polite">
        {pickedPt ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <div className="space-y-1">
              <p className="flex items-center gap-2 font-medium tracking-[-0.02em]">
                <i className="map-swatch" style={{ ["--h" as string]: hue(pickedPt.category) }} aria-hidden="true" />
                {pickedPt.name}
                <span className="font-normal text-muted-foreground">{pickedPt.catName}</span>
              </p>
              <p className="mono-num text-xs text-muted-foreground">
                {fmt(pickedPt.stars)} stars · pushed {ago(pickedPt.days)} · {pickedPt.license ?? "no license detected"} · score {pickedPt.score}/100
              </p>
            </div>
            <Link href={`/agents/${pickedPt.slug}`} className="rounded-full bg-ink/[0.08] px-4 py-2 text-sm font-medium transition-colors hover:bg-ink/[0.14] focus-visible:ring-2 focus-visible:ring-ring">
              Open {pickedPt.name}
            </Link>
          </div>
        ) : (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-muted-foreground">
            <span>Hover or tap a dot. Quick picks:</span>
            <button type="button" className="map-chip" onClick={() => setPicked(topStar.slug)}>Most starred: {topStar.name}</button>
            <button type="button" className="map-chip" onClick={() => setPicked(quietest.slug)}>Longest quiet: {quietest.name} ({Math.round(quietest.days)} d)</button>
          </p>
        )}
      </div>
    </figure>
  );
}
