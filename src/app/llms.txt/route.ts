import { BEST_PAGES, CATEGORIES } from "@/lib/data";
import { SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_TAGLINE} Rankings use public GitHub signals (stars, recent activity, license) and a published formula. Sponsorship never changes rankings.`,
    "",
    "## Methodology",
    `- [How rankings work](${absoluteUrl("/methodology")}): inclusion rule, score formula and data sources`,
    "",
    "## Rankings",
    ...BEST_PAGES.map((b) => `- [${b.h1}](${absoluteUrl(`/best/${b.slug}`)})`),
    "",
    "## Categories",
    ...CATEGORIES.map((c) => `- [${c.name}](${absoluteUrl(`/categories/${c.slug}`)}): ${c.blurb}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
