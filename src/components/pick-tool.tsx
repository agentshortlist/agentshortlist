"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KIND_LABEL, type Kind } from "@/content/verified-meta";
import type { CardView } from "@/lib/verified-view";

const DAY = 86_400_000;
const daysSince = (d: string | null) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / DAY) : null);

const FILTERS = [
  { id: "readOnly", label: "Has a documented read-only option", test: (c: CardView) => c.facts.readOnly === "yes" },
  { id: "noTelemetry", label: "Project says it sends no telemetry", test: (c: CardView) => c.facts.telemetry === "claimed-off" },
  { id: "local", label: "Can run on my machine", test: (c: CardView) => c.facts.hosting === "local" || c.facts.hosting === "both" },
  { id: "noAdv", label: "No published advisory affects the latest version", test: (c: CardView) => c.adv.latest === 0 },
  { id: "fresh", label: "Pushed in the last 30 days", test: (c: CardView) => (daysSince(c.lastPush) ?? 999) <= 30 },
] as const;

// Es un filtro, no una clasificación: cada resultado muestra qué condiciones cumple, cuáles no y cuáles no sabemos.
export function PickTool({ cards }: { cards: CardView[] }) {
  const kinds = useMemo(() => [...new Set(cards.map((c) => c.facts.kind))].sort((a, b) => KIND_LABEL[a].localeCompare(KIND_LABEL[b])), [cards]);
  const [kind, setKind] = useState<Kind | "all">("all");
  const [on, setOn] = useState<string[]>([]);

  const shown = useMemo(() => {
    const list = cards.filter((c) => kind === "all" || c.facts.kind === kind);
    const active = FILTERS.filter((f) => on.includes(f.id));
    return list
      .map((c) => ({ c, pass: active.filter((f) => f.test(c)).length, total: active.length }))
      .filter((x) => x.pass === x.total)
      .sort((a, b) => a.c.name.localeCompare(b.c.name));
  }, [cards, kind, on]);

  const toggle = (id: string) => setOn((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const chip = (active: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-ink bg-ink text-paper" : "border-ink/20 hover:bg-ink/5"}`;

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="eyebrow">What do you need it for?</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={kind === "all"} onClick={() => setKind("all")} className={chip(kind === "all")}>Anything</button>
          {kinds.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{KIND_LABEL[k]}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="eyebrow">What must it meet?</legend>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={on.includes(f.id)} onClick={() => toggle(f.id)} className={chip(on.includes(f.id))}>{f.label}</button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          &quot;Not verified&quot; never counts as meeting a condition: if we could not check it, the server is left out when you ask for it.
        </p>
      </fieldset>

      <div aria-live="polite" className="space-y-3">
        <p className="text-sm text-muted-foreground">{shown.length} of {cards.length} verified servers match.</p>
        {shown.length === 0 ? (
          <p className="surface p-5 text-sm">
            None of our verified servers meets all of that. Loosen a condition, or check the <Link href="/verified" className="underline underline-offset-4">full list</Link>.
            We only cover servers we have read, so this is not a statement about the whole ecosystem.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {shown.map(({ c }) => (
              <li key={c.slug} className="surface space-y-3 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/agents/${c.slug}#verified`} className="font-medium tracking-[-0.02em] underline-offset-4 hover:underline">{c.name}</Link>
                  <span className="text-xs text-muted-foreground">{KIND_LABEL[c.facts.kind]}</span>
                </div>
                <p className="text-sm leading-[1.55] text-foreground/85">{c.rows.madeFor}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {FILTERS.map((f) => {
                    const known =
                      f.id === "readOnly" ? c.facts.readOnly !== "unknown" : f.id === "noTelemetry" ? c.facts.telemetry !== "unknown" : f.id === "noAdv" ? c.adv.latest !== null : true;
                    return (
                      <li key={f.id}>
                        <span aria-hidden="true">{!known ? "? " : f.test(c) ? "✓ " : "✗ "}</span>
                        <span className="sr-only">{!known ? "Not verified: " : f.test(c) ? "Meets: " : "Does not meet: "}</span>
                        {f.label}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
