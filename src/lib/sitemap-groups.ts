import { BEST_PAGES, CATEGORIES, getAgents } from "@/lib/data";
import { PAIRS } from "@/lib/compare";
import { snapshotCount } from "@/lib/history";
import { getPosts } from "@/lib/blog";
import { allAdvisories } from "@/lib/advisories";
import { VERIFIED, getVerified } from "@/content/verified";
import { TESTS } from "@/content/tests";
import { absoluteUrl } from "@/lib/site";

// Regla: toda página que se puede indexar va en el sitemap, y solo esas. Nada se oculta para "ayudar" a que Google indexe antes.
// El sitemap se divide por tipo para que Search Console muestre la cobertura de cada grupo por separado.
// lastmod solo cuando hay una fecha real de cambio de contenido (post, tarjeta, prueba, aviso); si no la hay, no se pone.
// changefreq y priority no se usan: Google no los lee.
export type SitemapEntry = { url: string; lastmod?: string };
export type SitemapGroup = { id: string; label: string; entries: SitemapEntry[] };

const day = (iso: string) => (iso.length === 10 ? iso : iso.slice(0, 10));
const latest = (dates: string[]) => (dates.length ? day(dates.slice().sort().at(-1)!) : undefined);
const entry = (path: string, lastmod?: string): SitemapEntry => ({ url: absoluteUrl(path), ...(lastmod ? { lastmod } : {}) });

export function sitemapGroups(): SitemapGroup[] {
  const posts = getPosts();
  const radar = posts.filter((p) => p.tags.includes("risk-radar"));
  const cardDates = VERIFIED.map((c) => c.reviewedAt);
  const advisoryDates = allAdvisories().flatMap(([, pkgs]) => pkgs.flatMap((p) => p.vulns.map((v) => v.published))).filter(Boolean) as string[];
  const agents = getAgents();
  const withCard = agents.filter((a) => getVerified(a.slug));
  const withoutCard = agents.filter((a) => !getVerified(a.slug));

  const groups: SitemapGroup[] = [
    {
      id: "pages",
      label: "Páginas",
      entries: [
        entry("/"),
        entry("/methodology"),
        entry("/about"),
        entry("/privacy"),
        entry("/coverage"),
        entry("/data", latest(TESTS.map((t) => t.testedAt))),
        entry("/verified", latest(cardDates)),
        entry("/check"),
        entry("/radar", latest(radar.map((p) => p.updated))),
        entry("/advisories", latest(advisoryDates)),
        entry("/pick"),
        entry("/compare"),
        entry("/compare/live"),
        ...(snapshotCount >= 2 ? [entry("/changes")] : []),
        entry("/sponsor"),
        entry("/sponsor/terms"),
      ],
    },
    {
      id: "posts",
      label: "Blog",
      entries: posts.length ? [entry("/blog", latest(posts.map((p) => p.updated))), ...posts.map((p) => entry(`/blog/${p.slug}`, day(p.updated)))] : [],
    },
    { id: "best", label: "Mejores (best)", entries: BEST_PAGES.map((b) => entry(`/best/${b.slug}`)) },
    { id: "categories", label: "Categorías", entries: CATEGORIES.map((c) => entry(`/categories/${c.slug}`)) },
    { id: "agents-verified", label: "Fichas con tarjeta verificada", entries: withCard.map((a) => entry(`/agents/${a.slug}`, day(getVerified(a.slug)!.reviewedAt))) },
    { id: "agents", label: "Fichas sin tarjeta verificada", entries: withoutCard.map((a) => entry(`/agents/${a.slug}`)) },
    { id: "compare", label: "Comparativas", entries: PAIRS.map((p) => entry(`/compare/${p.slug}`)) },
  ];
  return groups.filter((g) => g.entries.length > 0);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function groupXml(g: SitemapGroup): string {
  const rows = g.entries.map((e) => `  <url><loc>${esc(e.url)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

export function indexXml(groups: SitemapGroup[]): string {
  const rows = groups
    .map((g) => {
      const lm = latest(g.entries.map((e) => e.lastmod).filter(Boolean) as string[]);
      return `  <sitemap><loc>${esc(absoluteUrl(`/sitemaps/${g.id}.xml`))}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}</sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}
