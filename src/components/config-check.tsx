"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CardView } from "@/lib/verified-view";

type Entry = { name: string; text: string; env: Record<string, unknown> };

// Todo ocurre en el navegador: la configuración pegada no se envía a ningún sitio ni se guarda.
function parse(input: string): { entries: Entry[]; error?: string } {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { entries: [], error: "That is not valid JSON. Paste the contents of your MCP configuration file (the JSON with an mcpServers section)." };
  }
  const root = data as Record<string, unknown>;
  const servers = (root?.mcpServers ?? root?.servers ?? (root?.mcp as Record<string, unknown> | undefined)?.servers ?? root) as Record<string, unknown>;
  if (!servers || typeof servers !== "object") return { entries: [], error: "No servers found in that JSON." };
  const entries = Object.entries(servers)
    .filter(([, v]) => v && typeof v === "object")
    .map(([name, v]) => ({ name, text: JSON.stringify(v), env: ((v as Record<string, unknown>).env as Record<string, unknown>) ?? {} }));
  return entries.length ? { entries } : { entries: [], error: "No servers found. Look for the mcpServers section." };
}

const num = (v: string) => v.split(/[.\-+]/).map((p) => parseInt(p, 10)).map((n) => (Number.isNaN(n) ? 0 : n));
const cmp = (a: string, b: string) => {
  const x = num(a), y = num(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d) return d;
  }
  return 0;
};
const affected = (ranges: { introduced?: string; fixed?: string; last_affected?: string }[][], v: string) =>
  ranges.some((ev) => {
    let hit = false;
    let start: string | null = null;
    for (const e of ev) {
      if (e.introduced !== undefined) start = e.introduced;
      if (start !== null && (e.fixed !== undefined || e.last_affected !== undefined)) {
        const lo = cmp(v, start) >= 0;
        const hi = e.fixed !== undefined ? cmp(v, e.fixed) < 0 : cmp(v, e.last_affected as string) <= 0;
        if (lo && hi) hit = true;
        start = null;
      }
    }
    if (start !== null && cmp(v, start) >= 0) hit = true; // sin versión corregida
    return hit;
  });


// Busca secretos escritos en claro. Solo se muestra el NOMBRE de la variable y nunca el valor.
const SECRET_NAME = /(key|token|secret|password|passwd|credential|dsn|connection_?string)/i;
const REFERENCE = /^(\$\{?[A-Za-z_]|<.*>$|\$\{input:|\$\{env:|%[A-Za-z_]+%)/;
const TOKEN_SHAPES: [RegExp, string][] = [
  [/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/, "a GitHub token"],
  [/sk-[A-Za-z0-9_-]{20,}/, "an API key starting with sk-"],
  [/AKIA[0-9A-Z]{16}/, "an AWS access key"],
  [/xox[abprs]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/:\/\/[^\s:@\/"]+:[^\s@\/"]{3,}@/, "a connection string with a password"],
];
function findSecrets(e: Entry): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(e.env)) {
    if (!SECRET_NAME.test(k) || typeof v !== "string") continue;
    const val = v.trim();
    if (val.length < 8 || REFERENCE.test(val)) continue;
    out.push(`${k} holds a literal value (${val.length} characters, not shown)`);
  }
  for (const [re, label] of TOKEN_SHAPES) {
    if (re.test(e.text) && !out.some((o) => o.includes(label))) out.push(`the configuration contains ${label}`);
  }
  return out;
}

const SAMPLE = `{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"]
    },
    "playwright": { "command": "npx", "args": ["@playwright/mcp@0.0.35"] },
    "chrome": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] }
  }
}`;

export function ConfigCheck({ cards }: { cards: CardView[] }) {
  const [text, setText] = useState("");
  const result = useMemo(() => (text.trim() ? parse(text) : null), [text]);

  const rows = useMemo(() => {
    if (!result || result.error) return [];
    return result.entries.map((e) => {
      const low = e.text.toLowerCase();
      const card = cards.find((c) => c.match.some((m) => low.includes(m.toLowerCase())));
      const secrets = findSecrets(e);
      if (!card) return { e, card: null as CardView | null, notes: [] as string[], advice: [] as string[], secrets };
      const notes = card.checks.filter((c) => c.ok.length === 0 || !c.ok.some((t) => e.text.includes(t))).map((c) => c.message);
      const advice: string[] = [];
      for (const p of card.packages) {
        const esc = p.name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
        const m = e.text.match(new RegExp(`${esc}(?:@|==)(\\d[\\w.+-]*)`));
        if (m) {
          const hits = p.vulns.filter((v) => affected(v.ranges, m[1]));
          advice.push(
            hits.length
              ? `${p.name} is pinned to ${m[1]}, which falls in the affected range of ${hits.length} published advisor${hits.length === 1 ? "y" : "ies"}: ${hits.map((h) => h.id).join(", ")}. The latest version is ${p.latest ?? "unknown"}. This match is approximate; open each advisory to confirm.`
              : `${p.name} is pinned to ${m[1]}. We found no published advisory whose range includes it. The latest version is ${p.latest ?? "unknown"}.`,
          );
        } else if (p.vulns.length && /@latest|npx|uvx/.test(e.text)) {
          advice.push(`No version pinned for ${p.name}, so you run whatever is current (${p.latest ?? "unknown"}). ${p.vulns.length} ${p.vulns.length === 1 ? "advisory has" : "advisories have"} been published for the package; none affect that version unless the card says so.`);
        }
      }
      return { e, card, notes, advice, secrets };
    });
  }, [result, cards]);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="cfg" className="eyebrow">Your MCP configuration (JSON)</label>
        <textarea
          id="cfg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          rows={12}
          placeholder={SAMPLE}
          className="mono-num w-full rounded-xl border border-ink/15 bg-transparent p-4 text-[13px] leading-[1.6] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setText(SAMPLE)} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5">Try an example</button>
          {text && <button type="button" onClick={() => setText("")} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5">Clear</button>}
        </div>
        <p className="text-sm text-muted-foreground">
          This runs in your browser. Nothing you paste is sent anywhere or stored. Remove tokens and passwords anyway.
        </p>
      </div>

      {result?.error && <p role="alert" className="surface p-4 text-sm">{result.error}</p>}

      {rows.length > 0 && (
        <ul className="space-y-4" aria-live="polite">
          {rows.map(({ e, card, notes, advice, secrets }) => (
            <li key={e.name} className="surface space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="mono-num font-medium">{e.name}</p>
                {card ? (
                  <Link href={`/agents/${card.slug}#verified`} className="text-sm underline underline-offset-4 hover:text-foreground">
                    Matches the {card.name} card
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">Not one of our verified cards yet, so we have nothing to check.</span>
                )}
              </div>
              {secrets.length > 0 && (
                <div role="alert" className="rounded-xl border border-ink/25 bg-ink/[0.05] p-4 text-[15px] leading-[1.55]">
                  <p className="font-medium">Possible secret in plain text</p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {secrets.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Do not share this file or commit it. Use an environment variable, your client&apos;s secret input or a secrets manager, and rotate the
                    value if it has been exposed.
                  </p>
                </div>
              )}
              {card && (
                <>
                  {notes.length === 0 && advice.length === 0 && secrets.length === 0 && <p className="text-sm text-muted-foreground">Nothing to flag from the documented options on its card. That is not a security review.</p>}
                  {notes.map((n) => <p key={n} className="text-[15px] leading-[1.55]">{n}</p>)}
                  {advice.map((n) => <p key={n} className="text-[15px] leading-[1.55]">{n}</p>)}
                  <p className="text-sm text-muted-foreground">
                    {card.adv.packages > 0
                      ? `${card.adv.total} ${card.adv.total === 1 ? "advisory" : "advisories"} published for its package${card.adv.packages > 1 ? "s" : ""}${card.adv.latest !== null ? `, ${card.adv.latest} affecting the latest version` : ""}.`
                      : "Advisories not checked for this project."}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
