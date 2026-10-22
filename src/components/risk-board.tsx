"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KIND_LABEL } from "@/content/verified-meta";
import type { CardView } from "@/lib/verified-view";

// Tablero de lectura rápida: una fila por servidor, ordenable, con barra de seguridad y enlace a su ficha.
// Barra larga = menos riesgo según lo que hemos leído. Las filas con datos limitados van rayadas y marcadas como estimación.
const COL = { Low: "rgb(34 150 90)", Medium: "rgb(214 158 46)", High: "rgb(200 70 60)" } as const;
const HEALTH_RANK = { Strong: 0, Fair: 1, Weak: 2 } as const;
type Sort = "risk" | "health";

export function RiskBoard({ cards }: { cards: CardView[] }) {
  const [sort, setSort] = useState<Sort>("risk");
  const [all, setAll] = useState(false);
  const [only, setOnly] = useState(false);

  const rows = useMemo(() => {
    const list = cards.filter((c) => !only || !c.risk.limited);
    return [...list].sort((a, b) =>
      Number(a.risk.limited) - Number(b.risk.limited) ||
      (sort === "risk"
        ? a.risk.score - b.risk.score || HEALTH_RANK[a.health.level] - HEALTH_RANK[b.health.level] || a.name.localeCompare(b.name)
        : HEALTH_RANK[a.health.level] - HEALTH_RANK[b.health.level] || b.health.score - a.health.score || a.risk.score - b.risk.score || a.name.localeCompare(b.name)),
    );
  }, [cards, sort, only]);
  const shown = all ? rows : rows.slice(0, 12);

  const best = cards.filter((c) => c.risk.level === "Low" && !c.risk.limited && c.health.level === "Strong").length;
  const lowEst = cards.filter((c) => c.risk.limited).length;
  const higher = cards.filter((c) => !c.risk.limited && c.risk.level !== "Low").length;

  const chip = (a: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${a ? "border-ink bg-ink text-paper" : "border-ink/20 hover:bg-ink/5"}`;

  return (
    <div className="space-y-6">
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-4"><dt className="text-sm text-muted-foreground">Low risk and strong health, with verified data</dt><dd className="mt-1 text-2xl font-medium tracking-[-0.02em]" style={{ color: COL.Low }}>{best}</dd></div>
        <div className="surface p-4"><dt className="text-sm text-muted-foreground">Medium or high risk, with verified data</dt><dd className="mt-1 text-2xl font-medium tracking-[-0.02em]" style={{ color: COL.Medium }}>{higher}</dd></div>
        <div className="surface p-4"><dt className="text-sm text-muted-foreground">Estimate only: several items not verified</dt><dd className="mt-1 text-2xl font-medium tracking-[-0.02em] text-muted-foreground">{lowEst}</dd></div>
      </dl>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sort and filter">
        <button type="button" aria-pressed={sort === "risk"} onClick={() => setSort("risk")} className={chip(sort === "risk")}>Lowest risk first</button>
        <button type="button" aria-pressed={sort === "health"} onClick={() => setSort("health")} className={chip(sort === "health")}>Healthiest first</button>
        <button type="button" aria-pressed={only} onClick={() => setOnly((v) => !v)} className={chip(only)}>Verified data only</button>
      </div>

      <ol className="surface divide-y divide-ink/10">
        {shown.map((c, i) => {
          const safety = 100 - c.risk.score;
          const top = c.risk.level === "Low" && !c.risk.limited && c.health.level === "Strong";
          return (
            <li key={c.slug} className="grid items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[1.75rem_minmax(0,14rem)_minmax(0,1fr)_10.5rem]">
              <span className="mono-num hidden text-sm text-muted-foreground sm:block">{i + 1}</span>
              <div className="min-w-0">
                <Link href={`/agents/${c.slug}#verified`} className="block font-medium leading-[1.25] tracking-[-0.02em] underline-offset-4 hover:underline">{c.name}</Link>
                <span className="text-xs text-muted-foreground">{KIND_LABEL[c.facts.kind]}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10" role="img" aria-label={`${c.risk.level} risk${c.risk.limited ? ", estimate" : ""}`}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(safety, 4)}%`,
                      background: c.risk.limited
                        ? `repeating-linear-gradient(135deg, ${COL[c.risk.level]} 0 6px, transparent 6px 11px)`
                        : COL[c.risk.level],
                    }}
                  />
                </div>
                <span className="w-24 shrink-0 text-sm" style={{ color: c.risk.limited ? undefined : COL[c.risk.level] }}>
                  {c.risk.level} risk{c.risk.limited ? <span className="text-muted-foreground"> (est.)</span> : null}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-end">
                {top && <span className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: COL.Low, color: COL.Low }}>Best</span>}
                <span className="whitespace-nowrap">{c.health.level} health</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Showing {shown.length} of {rows.length} verified servers. Estimates are listed after the rest.</p>
        {rows.length > 12 && (
          <button type="button" onClick={() => setAll((v) => !v)} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5">
            {all ? "Show fewer" : `Show all ${rows.length}`}
          </button>
        )}
      </div>

      <p className="text-xs leading-[1.6] text-muted-foreground">
        <strong>How to read it:</strong> a longer bar means less risk according to what its card documents. Striped bars are estimates, because several items could not be verified, so they never get
        the &quot;Best&quot; tag. <strong>Best</strong> means low risk and strong project health with verified data. Health and risk are simple rules (see the{" "}
        <Link href="/methodology#scores" className="underline underline-offset-4">methodology</Link>), not a security audit.
      </p>
    </div>
  );
}
