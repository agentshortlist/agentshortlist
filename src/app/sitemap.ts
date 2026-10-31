import type { MetadataRoute } from "next";
import { BEST_PAGES, CATEGORIES, getAgents } from "@/lib/data";
import { PAIRS } from "@/lib/compare";
import { snapshotCount } from "@/lib/history";
import { getPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const verified = new Date(getAgents().map((a) => a.verifiedAt).sort().at(-1)!);
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    lastModified: verified,
    changeFrequency: "weekly",
    priority,
  });
  return [
    entry("/", 1),
    entry("/methodology", 0.5),
    entry("/about", 0.4),
    entry("/privacy", 0.2),
    entry("/coverage", 0.5),
    entry("/data", 0.5),
    entry("/verified", 0.7),
    entry("/check", 0.6),
    entry("/radar", 0.6),
    entry("/advisories", 0.7),
    entry("/pick", 0.6),
    entry("/compare/live", 0.6),
    ...(getPosts().length ? [entry("/blog", 0.6), ...getPosts().map((p) => entry(`/blog/${p.slug}`, 0.6))] : []),
    ...(snapshotCount >= 2 ? [entry("/changes", 0.5)] : []),
    entry("/sponsor", 0.4),
    entry("/sponsor/terms", 0.2),
    entry("/compare", 0.5),
    ...PAIRS.map((p) => entry(`/compare/${p.slug}`, 0.5)),
    ...BEST_PAGES.map((b) => entry(`/best/${b.slug}`, 0.9)),
    ...CATEGORIES.map((c) => entry(`/categories/${c.slug}`, 0.7)),
    ...getAgents().map((a) => entry(`/agents/${a.slug}`, 0.6)),
  ];
}
