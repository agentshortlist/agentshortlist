"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/track";
import { CopyTextButton } from "@/components/copy-text-button";
import { KIND_LABEL, type Kind } from "@/content/verified-meta";
import type { CardView } from "@/lib/verified-view";
import { TestedChip } from "@/components/tested-chip";

const DAY = 86_400_000;
const daysSince = (d: string | null) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / DAY) : null);

const FILTERS = [
  { id: "readOnly", label: "Has a documented read-only option", test: (c: CardView) => c.facts.readOnly === "yes" },
  { id: "noTelemetry", label: "Project says it sends no telemetry", test: (c: CardView) => c.facts.telemetry === "claimed-off" },
  { id: "noAccount", label: "Needs no third-party account or key", test: (c: CardView) => c.needs === "nothing" || c.needs === "own-systems" || c.needs === "keyless-tier" },
  { id: "openSource", label: "Open-source license", test: (c: CardView) => c.openSource },
  { id: "local", label: "Can run on my machine", test: (c: CardView) => c.facts.hosting === "local" || c.facts.hosting === "both" },
  { id: "noAdv", label: "No published advisory affects the latest version", test: (c: CardView) => c.adv.latest === 0 },
  { id: "lowRisk", label: "Low risk from what we read", test: (c: CardView) => c.risk.level === "Low" && !c.risk.limited },
  { id: "healthy", label: "Strong project health", test: (c: CardView) => c.health.level === "Strong" },
  { id: "tested", label: "Tested by us", test: (c: CardView) => c.tested !== null },
  { id: "fresh", label: "Pushed in the last 30 days", test: (c: CardView) => (daysSince(c.lastPush) ?? 999) <= 30 },
] as const;

// "tested" filtra pero no se lista como condición en cada resultado: no queremos un ✗ en las fichas aún sin probar.
const QUIET = ["tested"];

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

  // Estado inicial desde la URL (?kind=database&f=readOnly,local) para poder compartir una selección.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const k = q.get("kind");
    if (k && kinds.includes(k as Kind)) setKind(k as Kind);
    const f = (q.get("f") ?? "").split(",").filter((id) => FILTERS.some((x) => x.id === id));
    if (f.length) setOn(f);
  }, [kinds]);

  const sync = (nextKind: Kind | "all", nextOn: string[]) => {
    const q = new URLSearchParams();
    if (nextKind !== "all") q.set("kind", nextKind);
    if (nextOn.length) q.set("f", nextOn.join(","));
    window.history.replaceState(null, "", q.toString() ? `?${q}` : window.location.pathname);
  };

  const markdown = () => {
    const active = FILTERS.filter((f) => on.includes(f.id));
    const head = [
      "# MCP shortlist",
      "",
      `Source: agentshortlist.dev/pick, ${new Date().toISOString().slice(0, 10)}. Servers we have read, filtered by what they must meet. Not a security review.`,
      "",
      `Job: ${kind === "all" ? "anything" : KIND_LABEL[kind]}`,
      `Must meet: ${active.length ? active.map((f) => f.label).join("; ") : "nothing selected"}`,
      "",
    ];
    const rows = shown.map(({ c }) => `- **${c.name}** (${KIND_LABEL[c.facts.kind]}): health ${c.health.level}, risk ${c.risk.level}${c.risk.limited ? " (estimate)" : ""}. https://agentshortlist.dev/agents/${c.slug}#verified`);
    return [...head, ...(rows.length ? rows : ["No verified server meets all of that."])].join("\n");
  };

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = window.setTimeout(() => track("pick_use", { kind, filters: on.length, results: shown.length }), 1200);
    return () => window.clearTimeout(t);
  }, [kind, on, shown.length]);

  const toggle = (id: string) => {
    const next = on.includes(id) ? on.filter((x) => x !== id) : [...on, id];
    setOn(next);
    sync(kind, next);
  };
  const pickKind = (k: Kind | "all") => {
    setKind(k);
    sync(k, on);
  };
  const chip = (active: boolean) => `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-ink bg-ink text-paper" : "border-ink/20 hover:bg-ink/5"}`;

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="eyebrow">What do you need it for?</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={kind === "all"} onClick={() => pickKind("all")} className={chip(kind === "all")}>Anything</button>
          {kinds.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => pickKind(k)} className={chip(kind === k)}>{KIND_LABEL[k]}</button>
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">{shown.length} of {cards.length} verified servers match.</p>
          <CopyTextButton text={() => window.location.href} label="Copy link to this selection" doneLabel="Link copied" event="pick_share" className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:bg-ink/5" />
          <CopyTextButton text={markdown} label="Copy as Markdown" event="pick_export" className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:bg-ink/5" />
        </div>
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
                {c.tested && <div><TestedChip mark={c.tested} compact /></div>}
                <p className="mono-num text-xs text-muted-foreground">Health {c.health.level} · Risk {c.risk.level}{c.risk.limited ? " (estimate)" : ""}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {FILTERS.filter((f) => !QUIET.includes(f.id)).map((f) => {
                    const known =
                      f.id === "readOnly" ? c.facts.readOnly !== "unknown" : f.id === "noTelemetry" ? c.facts.telemetry !== "unknown" : f.id === "noAdv" ? c.adv.latest !== null : f.id === "noAccount" ? c.needs !== "unknown" : f.id === "lowRisk" ? !c.risk.limited : true;
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
