import { getPost, getPosts } from "@/lib/blog";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "AgentShortlist blog";
export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  return ogCard({ eyebrow: "Blog", title: p?.title ?? "AgentShortlist blog", sub: p ? `By ${p.author}` : undefined, seed: slug });
}
