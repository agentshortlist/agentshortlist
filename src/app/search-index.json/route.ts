import { BEST_PAGES, CATEGORIES, getAgents, getCategory } from "@/lib/data";
import { PAIRS } from "@/lib/compare";

export const dynamic = "force-static";

export type SearchEntry = { k: string; t: string; d: string; h: string; w: string };

// Índice del buscador: se genera en el build y se descarga solo al abrir el buscador por primera vez.
export function GET() {
  const entries: SearchEntry[] = [
    ...getAgents().map((a) => ({
      k: "Tool", t: a.name, d: a.description ?? "", h: `/agents/${a.slug}`,
      w: `${getCategory(a.category)?.name ?? ""} ${a.license ?? ""} ${a.slug}`,
    })),
    ...BEST_PAGES.map((b) => ({ k: "Ranking", t: b.h1, d: `For ${b.audience}.`, h: `/best/${b.slug}`, w: b.noun })),
    ...CATEGORIES.map((c) => ({ k: "Category", t: c.name, d: c.blurb, h: `/categories/${c.slug}`, w: c.noun })),
    ...PAIRS.map((p) => ({
      k: "Compare", t: `${p.a.name} vs ${p.b.name}`, d: `${getCategory(p.category)?.name ?? ""}: ${p.a.score} against ${p.b.score} of 100.`,
      h: `/compare/${p.slug}`, w: `${p.a.slug} ${p.b.slug} versus`,
    })),
    { k: "Page", t: "Home", d: "Best AI agents, ranked by real signals.", h: "/", w: "start rankings" },
    { k: "Page", t: "Methodology", d: "How the score is calculated and what it does not measure.", h: "/methodology", w: "score formula bias corrections" },
    { k: "Page", t: "Coverage", d: "What we track, what we exclude and why.", h: "/coverage", w: "open source license excluded scope" },
    { k: "Page", t: "Changes", d: "What changed in the rankings.", h: "/changes", w: "history feed atom weekly" },
    { k: "Page", t: "Compare", d: "Head-to-head comparisons.", h: "/compare", w: "versus side by side" },
    { k: "Page", t: "Sponsor", d: "Sponsored placements and newsletter mentions.", h: "/sponsor", w: "advertise featured" },
    { k: "Page", t: "Sponsorship terms", d: "Rules for sponsored placements.", h: "/sponsor/terms", w: "refund labeling" },
    { k: "Page", t: "Privacy", d: "What we collect and who processes it.", h: "/privacy", w: "newsletter data" },
  ];
  return Response.json(entries);
}
