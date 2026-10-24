import { META, type Facts } from "@/content/verified-meta";
import { VERIFIED, type Row, type VerifiedCard } from "@/content/verified";
import { getAdvisories } from "@/lib/advisories";
import { getAgent, isOpenSource } from "@/lib/data";
import { ACCESS, type Needs } from "@/content/access";

// Vista plana de cada ficha para las herramientas interactivas (comparador, selector, comprobador).
import { health, risk, type Health, type Risk } from "@/lib/scores";

export type CardView = {
  slug: string;
  name: string;
  version: string;
  reviewedAt: string;
  lastPush: string | null;
  facts: Facts;
  match: string[];
  checks: { ok: string[]; message: string }[];
  rows: Record<string, string>;
  hardening: string[];
  alternative: { name: string; url: string } | null;
  adv: { total: number; latest: number | null; packages: number };
  health: Health;
  risk: Risk;
  needs: Needs;
  openSource: boolean;
  packages: { name: string; ecosystem: string; latest: string | null; weeklyDownloads: number | null; vulns: { id: string; severity: string | null; summary: string; ranges: { introduced?: string; fixed?: string; last_affected?: string }[][] }[] }[];
};

const find = (rows: Row[], labels: string[]) => {
  for (const l of labels) {
    const r = rows.find((x) => x.label === l);
    if (r) return r.value;
  }
  return "Not listed";
};

const view = (c: VerifiedCard): CardView | null => {
  const a = getAgent(c.slug);
  const m = META[c.slug];
  if (!a || !m) return null;
  const pk = getAdvisories(c.slug);
  const known = pk.length > 0;
  const adv = {
    total: pk.reduce((n, p) => n + p.total, 0),
    latest: known && pk.every((p) => p.affectingLatest !== null) ? pk.reduce((n, p) => n + (p.affectingLatest ?? 0), 0) : null,
    packages: pk.length,
  };
  return {
    slug: c.slug,
    name: a.name,
    version: c.version,
    reviewedAt: c.reviewedAt,
    lastPush: a.lastPush ? a.lastPush.slice(0, 10) : null,
    facts: m.facts,
    match: m.match,
    checks: m.checks ?? [],
    rows: {
      madeFor: find(c.use, ["Made for"]),
      notFor: find(c.use, ["Not made for"]),
      tools: find(c.context, ["Tools"]),
      credentials: find(c.permissions, ["Credentials", "Secrets it needs"]),
      sends: find(c.permissions, ["Sends data to third parties"]),
      openIssues: find(c.maintenance, ["Open issues"]),
      can: c.permissions
        .filter((r) => !["Credentials", "Secrets it needs", "Sends data to third parties"].includes(r.label) && r.source !== "unknown")
        .map((r) => `${r.label}: ${r.value}`)
        .join(" "),
    },
    hardening: c.hardening.map((h) => h.title),
    alternative: c.alternative ? { name: c.alternative.name, url: c.alternative.url } : null,
    adv,
    health: health(a),
    needs: ACCESS[c.slug]?.needs ?? "unknown",
    openSource: isOpenSource(a),
    risk: risk({ facts: m.facts, adv, checks: m.checks ?? [] }),
    packages: pk.map((p) => ({
      name: p.name,
      ecosystem: p.ecosystem,
      latest: p.latest,
      weeklyDownloads: p.weeklyDownloads ?? null,
      vulns: p.vulns.map((v) => ({ id: v.id, severity: v.severity, summary: v.summary, ranges: v.ranges })),
    })),
  };
};

export const cardViews = (): CardView[] => VERIFIED.map(view).filter((x): x is CardView => x !== null);
