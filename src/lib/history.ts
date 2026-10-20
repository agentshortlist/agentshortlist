import { HISTORY } from "@/data/history";
import { getAgent, rank, type Agent } from "@/lib/data";
import {
  baselineFor,
  diffSnapshots,
  isEmptyDiff,
  series,
  sortedDates,
  type Diff,
  type Order,
  type Snapshot,
} from "@/lib/history-core";

export const history = HISTORY;
export const dates = sortedDates(HISTORY);
export const firstDate = dates[0];
export const latestDate = dates[dates.length - 1];
export const snapshotCount = dates.length;

// Orden por categoría de un registro, con la misma función de ranking publicada (no se duplica la fórmula).
export function orderOf(s: Snapshot): Order {
  const byCat: Record<string, Agent[]> = {};
  for (const [slug, t] of Object.entries(s.tools)) {
    (byCat[t[4]] ??= []).push({
      slug,
      name: slug,
      category: t[4],
      description: null,
      officialUrl: null,
      repoUrl: "",
      license: t[2],
      pricingModel: null,
      stars: t[0],
      lastPush: t[1],
      archived: t[3] === 1,
      sources: [],
      verifiedAt: s.verifiedAt,
    });
  }
  return Object.fromEntries(Object.entries(byCat).map(([c, list]) => [c, rank(list).map((a) => a.slug)]));
}

const orders: Record<string, Order> = Object.fromEntries(dates.map((d) => [d, orderOf(HISTORY[d])]));

export function changesSince(days: number) {
  const b = baselineFor(dates, latestDate, days);
  if (!b.date) return null;
  return { from: b.date, to: latestDate, spanDays: b.spanDays, requested: days, diff: diffSnapshots(HISTORY[b.date], HISTORY[latestDate], orders[b.date], orders[latestDate]) };
}

export function feedEntries(max = 30): { date: string; prevDate: string; diff: Diff }[] {
  const out: { date: string; prevDate: string; diff: Diff }[] = [];
  for (let i = dates.length - 1; i >= 1 && out.length < max; i--) {
    const diff = diffSnapshots(HISTORY[dates[i - 1]], HISTORY[dates[i]], orders[dates[i - 1]], orders[dates[i]]);
    if (!isEmptyDiff(diff)) out.push({ date: dates[i], prevDate: dates[i - 1], diff });
  }
  return out;
}

export function nameOf(slug: string, snap?: Snapshot) {
  return getAgent(slug)?.name ?? snap?.excluded.find((e) => e.slug === slug)?.name ?? slug;
}

export const starSeries = (slug: string) => series(HISTORY, slug, (t) => t[0]);

export function rankSeries(slug: string) {
  const out: { date: string; value: number }[] = [];
  for (const d of dates) {
    const t = HISTORY[d].tools[slug];
    if (!t) continue;
    const pos = orders[d][t[4]]?.indexOf(slug);
    if (pos !== undefined && pos >= 0) out.push({ date: d, value: pos + 1 });
  }
  return out;
}

export const trackedSince = (slug: string) => dates.find((d) => slug in HISTORY[d].tools) ?? null;
export const snapshotsFor = (slug: string) => dates.filter((d) => slug in HISTORY[d].tools).length;

export const REASON_TEXT: Record<string, string> = {
  inactive: "no push in the last 90 days",
  archived: "repository archived",
  "no English description": "no English description on GitHub",
  "not in the current list": "no longer in the curated list",
};
