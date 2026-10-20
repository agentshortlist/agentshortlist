import { BEST_PAGES, agentsForPage } from "@/lib/data";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "AgentShortlist ranking";
export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => BEST_PAGES.map((b) => ({ slug: b.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = BEST_PAGES.find((x) => x.slug === slug);
  return ogCard({
    eyebrow: "Ranking",
    title: b?.h1 ?? "AgentShortlist ranking",
    sub: b ? `${agentsForPage(b).length} tools scored on public GitHub signals` : undefined,
    seed: slug,
  });
}
