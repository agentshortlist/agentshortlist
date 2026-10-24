"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/lib/track";
import { CopyTextButton } from "@/components/copy-text-button";
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

const VERDICT = {
  fix: { label: "Fix first", text: "A plain-text secret or a pinned version inside a published advisory range." },
  review: { label: "Review", text: "At least one documented option is off, a pin is behind or missing, or nothing on our cards covers it." },
  clear: { label: "Nothing flagged", text: "From our data only. This is not a security review." },
} as const;
const READ_ONLY = { yes: "Documented by the project", no: "None documented", unknown: "Not verified" } as const;
const TELEMETRY = { "default-on": "Yes, with an opt-out", "claimed-off": "No, per the project", unknown: "Not verified" } as const;
const HOSTING = { local: "On your machine", hosted: "As a hosted service", both: "Locally or hosted", unknown: "Not verified" } as const;

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
      if (!card) return { e, card: null as CardView | null, notes: [] as string[], advice: [] as string[], secrets, verdict: "review" as "fix" | "review" | "clear" };
      const notes = card.checks.filter((c) => c.ok.length === 0 || !c.ok.some((t) => e.text.includes(t))).map((c) => c.message);
      const advice: string[] = [];
      let inRange = false;
      let behind = false;
      let unpinnedRisk = false;
      for (const p of card.packages) {
        const esc = p.name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
        const m = e.text.match(new RegExp(`${esc}(?:@|==)(\\d[\\w.+-]*)`));
        if (m) {
          const hits = p.vulns.filter((v) => affected(v.ranges, m[1]));
          if (hits.length) inRange = true;
          if (p.latest && cmp(m[1], p.latest) < 0) {
            behind = true;
            advice.push(`${p.name}: you pin ${m[1]} and the latest we know is ${p.latest}. Read the release notes before updating, and update the pin on purpose.`);
          }
          advice.push(
            hits.length
              ? `${p.name} is pinned to ${m[1]}, which falls in the affected range of ${hits.length} published advisor${hits.length === 1 ? "y" : "ies"}: ${hits.map((h) => h.id).join(", ")}. The latest version is ${p.latest ?? "unknown"}. This match is approximate; open each advisory to confirm.`
              : `${p.name} is pinned to ${m[1]}. We found no published advisory whose range includes it. The latest version is ${p.latest ?? "unknown"}.`,
          );
        } else if (p.vulns.length && e.text.includes(p.name) && /@latest|npx|uvx/.test(e.text)) {
          unpinnedRisk = true;
          advice.push(`No version pinned for ${p.name}, so you run whatever is current (${p.latest ?? "unknown"}). ${p.vulns.length} ${p.vulns.length === 1 ? "advisory has" : "advisories have"} been published for the package; none affect that version unless the card says so.`);
        }
      }
      const verdict: "fix" | "review" | "clear" = secrets.length || inRange ? "fix" : notes.length || behind || unpinnedRisk ? "review" : "clear";
      return { e, card, notes, advice, secrets, verdict };
    });
  }, [result, cards]);

  // Informe en Markdown: solo nombres, veredicto y avisos. Nunca valores de variables ni la configuración pegada.
  const report = () => {
    const out = [
      "# MCP configuration check",
      "",
      `Source: agentshortlist.dev/check, ${new Date().toISOString().slice(0, 10)}. A static check against our verified cards and published advisories. Not a security review.`,
      "",
    ];
    for (const { e, card, notes, advice, secrets, verdict } of rows) {
      out.push(`## ${e.name}`, card ? `- Matches the ${card.name} card: https://agentshortlist.dev/agents/${card.slug}#verified` : "- Not one of our verified cards yet: nothing to check.");
      if (card) out.push(`- Verdict: ${VERDICT[verdict].label}`, `- Read-only option: ${READ_ONLY[card.facts.readOnly]}`, `- Sends data by default: ${TELEMETRY[card.facts.telemetry]}`, `- Runs: ${HOSTING[card.facts.hosting]}`);
      for (const x of secrets) out.push(`- Possible secret: ${x}`);
      for (const x of [...notes, ...advice]) out.push(`- ${x}`);
      out.push("");
    }
    return out.join("\n");
  };

  const sent = useRef("");
  useEffect(() => {
    if (!rows.length) return;
    const key = `${rows.length}:${rows.map((r) => r.verdict).join(",")}`;
    if (sent.current === key) return;
    const t = window.setTimeout(() => {
      sent.current = key;
      track("check_scan", {
        servers: rows.length,
        matched: rows.filter((r) => r.card).length,
        fix_first: rows.filter((r) => r.verdict === "fix").length,
        secrets: rows.filter((r) => r.secrets.length > 0).length,
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [rows]);

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
          {!text && <button type="button" onClick={() => setText(SAMPLE)} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5">Try an example</button>}
          {text && <button type="button" onClick={() => setText("")} className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5">Clear</button>}
        </div>
        <p className="text-sm text-muted-foreground">
          Results update as you type. This runs in your browser. Nothing you paste is sent anywhere or stored. Remove tokens and passwords anyway.
        </p>
      </div>

      {result?.error && <p role="alert" className="surface p-4 text-sm">{result.error}</p>}

      {rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <CopyTextButton text={report} label="Copy report as Markdown" event="check_export" className="rounded-full border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5" />
          <span className="text-sm text-muted-foreground">Names, verdicts and advice only. Your configuration and any values are not included.</span>
        </div>
      )}

      {rows.length > 0 && (
        <ul className="space-y-4" aria-live="polite">
          {rows.map(({ e, card, notes, advice, secrets, verdict }) => (
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
                  <p className="text-sm">
                    <span className="font-medium">{VERDICT[verdict].label}.</span>{" "}
                    <span className="text-muted-foreground">{VERDICT[verdict].text}</span>
                  </p>
                  <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                    <div><dt className="text-muted-foreground">Read-only option</dt><dd>{READ_ONLY[card.facts.readOnly]}</dd></div>
                    <div><dt className="text-muted-foreground">Sends data by default</dt><dd>{TELEMETRY[card.facts.telemetry]}</dd></div>
                    <div><dt className="text-muted-foreground">Runs</dt><dd>{HOSTING[card.facts.hosting]}</dd></div>
                  </dl>
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
