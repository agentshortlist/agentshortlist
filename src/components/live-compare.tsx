"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KIND_LABEL } from "@/content/verified-meta";
import type { CardView } from "@/lib/verified-view";
import { track } from "@/lib/track";

const YES = { yes: "Documented", no: "None found", unknown: "Not verified" } as const;
const TEL = { "default-on": "On by default", "claimed-off": "Project says none", unknown: "Not verified" } as const;
const HOST = { local: "Runs on your machine", hosted: "Hosted service", both: "Local or hosted", unknown: "Not verified" } as const;

const ROWS: { label: string; get: (c: CardView) => string }[] = [
  { label: "Made for", get: (c) => c.rows.madeFor },
  { label: "Not made for", get: (c) => c.rows.notFor },
  { label: "Type", get: (c) => KIND_LABEL[c.facts.kind] },
  { label: "Runs", get: (c) => HOST[c.facts.hosting] },
  { label: "Tools", get: (c) => c.rows.tools },
  { label: "Project health", get: (c) => `${c.health.level} (${c.health.score}/100)${c.health.limited ? ", estimate" : ""}` },
  { label: "Risk from what we read", get: (c) => `${c.risk.level} (${c.risk.score}/100)${c.risk.limited ? ", estimate" : ""}` },
  { label: "Read-only option", get: (c) => YES[c.facts.readOnly] },
  { label: "Telemetry by default", get: (c) => TEL[c.facts.telemetry] },
  { label: "What it can do", get: (c) => c.rows.can || "Not assessed" },
  { label: "Credentials", get: (c) => c.rows.credentials },
  { label: "Sends data to third parties", get: (c) => c.rows.sends },
  { label: "Last push", get: (c) => c.lastPush ?? "Not verified" },
  { label: "Open issues", get: (c) => c.rows.openIssues },
  {
    label: "Published advisories",
    get: (c) => (c.adv.packages === 0 ? "Not checked" : `${c.adv.total} published${c.adv.latest !== null ? `, ${c.adv.latest} affecting the latest version` : ""}`),
  },
  { label: "Setups that limit it", get: (c) => (c.hardening.length ? c.hardening.join("; ") : "None on its card") },
  { label: "Alternative named by the project", get: (c) => c.alternative?.name ?? "None" },
];

export function LiveCompare({ cards }: { cards: CardView[] }) {
  const [sel, setSel] = useState<string[]>(["", "", ""]);

  // Estado inicial desde la URL (?a=slug&b=slug&c=slug) para poder compartir una comparación.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const init = ["a", "b", "c"].map((k) => q.get(k) ?? "");
    if (init.some(Boolean)) setSel(init.map((s) => (cards.some((c) => c.slug === s) ? s : "")));
  }, [cards]);

  const set = (i: number, v: string) => {
    const next = sel.map((s, j) => (j === i ? v : s));
    setSel(next);
    if (v) track("compare_use", { selected: next.filter(Boolean).length });
    const q = new URLSearchParams();
    next.forEach((s, j) => s && q.set("abc"[j], s));
    window.history.replaceState(null, "", q.toString() ? `?${q}` : window.location.pathname);
  };

  const chosen = sel.map((s) => cards.find((c) => c.slug === s)).filter((c): c is CardView => !!c);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {sel.map((s, i) => (
          <label key={i} className="block space-y-2">
            <span className="eyebrow">{i === 2 ? "Server 3 (optional)" : `Server ${i + 1}`}</span>
            <select
              value={s}
              onChange={(e) => set(i, e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-transparent p-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose a server</option>
              {[...cards].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <option key={c.slug} value={c.slug} disabled={sel.includes(c.slug) && s !== c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {chosen.length < 2 ? (
        <p className="surface p-5 text-sm text-muted-foreground">Choose at least two servers to compare them line by line.</p>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th scope="col" className="w-40 px-4 py-3 font-normal text-muted-foreground"><span className="sr-only">Field</span></th>
                {chosen.map((c) => (
                  <th key={c.slug} scope="col" className="px-4 py-3 align-top">
                    <Link href={`/agents/${c.slug}#verified`} className="font-medium underline-offset-4 hover:underline">{c.name}</Link>
                    <span className="block text-xs font-normal text-muted-foreground">{c.version}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const vals = chosen.map((c) => r.get(c));
                const differs = new Set(vals).size > 1;
                return (
                  <tr key={r.label} className="border-b border-ink/10 align-top last:border-0">
                    <th scope="row" className="px-4 py-3 font-normal text-muted-foreground">{r.label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={`px-4 py-3 leading-[1.55] ${differs ? "text-foreground" : "text-foreground/70"}`}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Every value comes from the verified card of each server, with its source and review date there. Rows that differ are shown in full contrast.
        This compares what the projects document, not how well they perform.
      </p>
    </div>
  );
}
