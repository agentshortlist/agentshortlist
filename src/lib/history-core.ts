// Lógica pura del historial: sin importaciones, para poder probarla con datos sintéticos.
// Nunca se rellena ni se estima un valor pasado: solo se usan los registros reales guardados.

export type SnapTool = [stars: number | null, lastPush: string | null, license: string | null, archived: 0 | 1, category: string];
export type SnapExcluded = { slug: string; name: string; reason: string; daysSincePush: number };
export type Snapshot = { verifiedAt: string; tools: Record<string, SnapTool>; excluded: SnapExcluded[] };
export type History = Record<string, Snapshot>;
export type Order = Record<string, string[]>; // categoría → slugs en orden de ranking

export const sortedDates = (h: History) => Object.keys(h).sort();

const dayMs = 86_400_000;
const toMs = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
export const daysBetween = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / dayMs);

// Registro de comparación para una ventana de N días: el más reciente que sea igual o anterior a (último - N).
// Si no existe, el primero disponible (ventana más corta, que se declara); si solo hay un registro, null.
export function baselineFor(dates: string[], latest: string, days: number): { date: string | null; spanDays: number } {
  const target = toMs(latest) - days * dayMs;
  const atOrBefore = dates.filter((d) => toMs(d) <= target && d < latest);
  if (atOrBefore.length) {
    const d = atOrBefore[atOrBefore.length - 1];
    return { date: d, spanDays: daysBetween(d, latest) };
  }
  const first = dates[0];
  if (first && first < latest) return { date: first, spanDays: daysBetween(first, latest) };
  return { date: null, spanDays: 0 };
}

export type RankMove = { slug: string; category: string; from: number; to: number };
export type Diff = {
  entered: string[];
  left: { slug: string; reason: string; daysSincePush: number | null }[];
  licenseChanges: { slug: string; from: string | null; to: string | null }[];
  starGains: { slug: string; delta: number }[];
  rankMoves: RankMove[];
};

export function diffSnapshots(prev: Snapshot, cur: Snapshot, prevOrder: Order, curOrder: Order): Diff {
  const entered = Object.keys(cur.tools).filter((s) => !(s in prev.tools));
  const left = Object.keys(prev.tools)
    .filter((s) => !(s in cur.tools))
    .map((slug) => {
      const ex = cur.excluded.find((e) => e.slug === slug);
      return { slug, reason: ex ? ex.reason : "not in the current list", daysSincePush: ex ? ex.daysSincePush : null };
    });
  const licenseChanges: Diff["licenseChanges"] = [];
  const starGains: Diff["starGains"] = [];
  for (const [slug, now] of Object.entries(cur.tools)) {
    const before = prev.tools[slug];
    if (!before) continue;
    if (before[2] !== now[2]) licenseChanges.push({ slug, from: before[2], to: now[2] });
    if (before[0] !== null && now[0] !== null && now[0] !== before[0]) starGains.push({ slug, delta: now[0] - before[0] });
  }
  starGains.sort((a, b) => b.delta - a.delta);
  const rankMoves: RankMove[] = [];
  for (const [category, order] of Object.entries(curOrder)) {
    const before = prevOrder[category] ?? [];
    order.forEach((slug, i) => {
      const j = before.indexOf(slug);
      if (j !== -1 && j !== i) rankMoves.push({ slug, category, from: j + 1, to: i + 1 });
    });
  }
  rankMoves.sort((a, b) => Math.abs(b.to - b.from) - Math.abs(a.to - a.from));
  return { entered, left, licenseChanges, starGains, rankMoves };
}

export const isEmptyDiff = (d: Diff) =>
  !d.entered.length && !d.left.length && !d.licenseChanges.length && !d.starGains.length && !d.rankMoves.length;

// Serie de un campo numérico de una herramienta a lo largo de los registros que la contienen.
export function series(h: History, slug: string, pick: (t: SnapTool) => number | null): { date: string; value: number }[] {
  const out: { date: string; value: number }[] = [];
  for (const d of sortedDates(h)) {
    const t = h[d].tools[slug];
    const v = t ? pick(t) : null;
    if (v !== null) out.push({ date: d, value: v });
  }
  return out;
}
