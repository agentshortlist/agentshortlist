import { CATEGORIES, ageDays, fmtDate, fmtStars, getAgentsByCategory, isOpenSource, rank, RECENCY_WINDOW_DAYS, type Ranked } from "@/lib/data";

// Barreras contra el relleno: solo pares del mismo grupo entre los 4 mejores, orden alfabético del slug,
// máximo 60 páginas, ambos pasan la regla de 90 días y un mínimo de datos reales por página.
export const TOP_N = 4;
export const MAX_PAGES = 60;
export const MIN_FACTS = 8;

export type Fact = { key: string; label: string; a: string; b: string; known: boolean; edge: "a" | "b" | null };
export type Pair = { slug: string; category: string; a: Ranked; b: Ranked; rankA: number; rankB: number; size: number; facts: Fact[]; known: number };

const edge = (x: number | null, y: number | null, higherWins: boolean): "a" | "b" | null => {
  if (x === null || y === null || x === y) return null;
  return (x > y) === higherWins ? "a" : "b";
};

export function buildFacts(a: Ranked, b: Ranked, rankA: number, rankB: number, size: number): Fact[] {
  const dA = ageDays(a);
  const dB = ageDays(b);
  const f = (key: string, label: string, av: string | null, bv: string | null, e: Fact["edge"] = null): Fact => ({
    key, label, a: av ?? "n/a", b: bv ?? "n/a", known: av !== null && bv !== null, edge: e,
  });
  return [
    f("stars", "GitHub stars", a.stars === null ? null : fmtStars(a.stars), b.stars === null ? null : fmtStars(b.stars), edge(a.stars, b.stars, true)),
    f("last-push", "Last push", a.lastPush ? fmtDate(a.lastPush) : null, b.lastPush ? fmtDate(b.lastPush) : null, edge(a.lastPush ? Date.parse(a.lastPush) : null, b.lastPush ? Date.parse(b.lastPush) : null, true)),
    f("days-since-push", "Days since last push", dA === null ? null : `${Math.round(dA)}`, dB === null ? null : `${Math.round(dB)}`, edge(dA === null ? null : Math.round(dA), dB === null ? null : Math.round(dB), false)),
    f("license", "License", a.license ?? "None detected", b.license ?? "None detected"),
    f("score", "Score", `${a.score} of 100`, `${b.score} of 100`, edge(a.score, b.score, true)),
    f("stars-points", "Stars points", `${Math.round(a.parts.stars)} of 50`, `${Math.round(b.parts.stars)} of 50`, edge(a.parts.stars, b.parts.stars, true)),
    f("activity-points", "Activity points", `${Math.round(a.parts.recency)} of 30`, `${Math.round(b.parts.recency)} of 30`, edge(a.parts.recency, b.parts.recency, true)),
    f("license-points", "License points", `${Math.round(a.parts.license)} of 20`, `${Math.round(b.parts.license)} of 20`, edge(a.parts.license, b.parts.license, true)),
    f("category-rank", "Rank in category", `#${rankA} of ${size}`, `#${rankB} of ${size}`, edge(rankA, rankB, false)),
  ];
}

export function allPairs(): Pair[] {
  const out: Pair[] = [];
  for (const c of CATEGORIES) {
    const ranked = rank(getAgentsByCategory(c.slug));
    if (ranked.length < 3) continue;
    const top = ranked.slice(0, TOP_N).filter((t) => (ageDays(t) ?? 999) <= RECENCY_WINDOW_DAYS);
    for (let i = 0; i < top.length; i++) {
      for (let j = i + 1; j < top.length; j++) {
        const [x, y] = [top[i], top[j]].sort((p, q) => p.slug.localeCompare(q.slug));
        const rankA = ranked.findIndex((r) => r.slug === x.slug) + 1;
        const rankB = ranked.findIndex((r) => r.slug === y.slug) + 1;
        const facts = buildFacts(x, y, rankA, rankB, ranked.length);
        const known = facts.filter((f) => f.known).length;
        if (known < MIN_FACTS) continue;
        out.push({ slug: `${x.slug}-vs-${y.slug}`, category: c.slug, a: x, b: y, rankA, rankB, size: ranked.length, facts, known });
      }
    }
  }
  return out.slice(0, MAX_PAGES);
}

export const PAIRS = allPairs();
export const getPair = (slug: string) => PAIRS.find((p) => p.slug === slug);
export const pairsInCategory = (cat: string) => PAIRS.filter((p) => p.category === cat);

// Hasta 3 comparaciones de una herramienta, empezando por la del rival más cercano en el ranking.
export function pairsFor(slug: string, max = 3): Pair[] {
  return PAIRS.filter((p) => p.a.slug === slug || p.b.slug === slug)
    .map((p) => ({ p, gap: Math.abs(p.rankA - p.rankB) }))
    .sort((x, y) => x.gap - y.gap || x.p.slug.localeCompare(y.p.slug))
    .slice(0, max)
    .map((x) => x.p);
}

export function summaryFor(p: Pair, categoryName: string): string {
  const { a, b } = p;
  const lead = a.score === b.score ? null : a.score > b.score ? [a, b] : [b, a];
  const head = lead
    ? `${lead[0].name} scores higher than ${lead[1].name} in ${categoryName}: ${lead[0].score} against ${lead[1].score} out of 100.`
    : `${a.name} and ${b.name} score the same in ${categoryName}: ${a.score} out of 100.`;
  return `${head} ${a.name} has ${fmtStars(a.stars)} GitHub stars and ${b.name} has ${fmtStars(b.stars)}. The score reflects popularity, recent activity and license, not performance on your task.`;
}

export function whoPicks(p: Pair): { label: string; text: string }[] {
  const { a, b } = p;
  const out: { label: string; text: string }[] = [];
  if (a.stars !== null && b.stars !== null) {
    out.push({
      label: "More GitHub stars",
      text: a.stars === b.stars ? `Both have ${fmtStars(a.stars)}.` : `${a.stars > b.stars ? a.name : b.name} (${fmtStars(Math.max(a.stars, b.stars))} against ${fmtStars(Math.min(a.stars, b.stars))}).`,
    });
  }
  if (a.lastPush && b.lastPush) {
    const same = a.lastPush.slice(0, 10) === b.lastPush.slice(0, 10);
    const newer = Date.parse(a.lastPush) >= Date.parse(b.lastPush) ? a : b;
    out.push({
      label: "More recent push",
      text: same ? `Both were pushed on ${fmtDate(a.lastPush)}.` : `${newer.name} (${fmtDate(newer.lastPush)} against ${fmtDate(newer === a ? b.lastPush : a.lastPush)}).`,
    });
  }
  const oa = isOpenSource(a);
  const ob = isOpenSource(b);
  out.push({
    label: "If the license matters to you",
    text:
      oa && ob
        ? `Both list an open-source license on GitHub: ${a.name} ${a.license}, ${b.name} ${b.license}.`
        : oa || ob
          ? `${oa ? a.name : b.name} lists an open-source license (${oa ? a.license : b.license}). For ${oa ? b.name : a.name}, check the project's own terms.`
          : `Neither lists an open-source license on GitHub. Check each project's own terms.`,
  });
  out.push({
    label: `Higher score in the category`,
    text: a.score === b.score ? `They tie at ${a.score} of 100.` : `${a.score > b.score ? a.name : b.name} (${Math.max(a.score, b.score)} against ${Math.min(a.score, b.score)} of 100).`,
  });
  return out;
}
