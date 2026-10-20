import { getVerified } from "@/content/verified";
import { fmtDate, fmtStars, getAgent, getAgents, getCategory } from "@/lib/data";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "AgentShortlist tool page";
export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => getAgents().map((a) => ({ slug: a.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getAgent(slug);
  if (!a) return ogCard({ eyebrow: "Tool", title: "AgentShortlist", seed: slug });
  const cat = getCategory(a.category)?.name ?? "Tool";
  const sub = getVerified(slug)
    ? "Verified card: what it can change, what it sends out, upkeep and advisories"
    : `${fmtStars(a.stars)} GitHub stars · last push ${fmtDate(a.lastPush)} · ${a.license ?? "license not stated"}`;
  return ogCard({ eyebrow: cat, title: a.name, sub, seed: slug });
}
