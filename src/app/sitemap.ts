import type { MetadataRoute } from "next";
import { BEST_PAGES, CATEGORIES, getAgents } from "@/lib/data";
import { snapshotCount } from "@/lib/history";
import { getPosts } from "@/lib/blog";
import { allAdvisories } from "@/lib/advisories";
import { VERIFIED, getVerified } from "@/content/verified";
import { TESTS } from "@/content/tests";
import { absoluteUrl } from "@/lib/site";

// Qué se ofrece a Google: solo páginas con contenido propio. Los datos de GitHub se refrescan cada día en el servidor, así que
// poner esa fecha como lastmod hacía que Google lo ignorase (283 de 296 URLs con la misma fecha). Ahora:
//  - lastmod solo cuando hay una fecha real de cambio de contenido (post, tarjeta, prueba, aviso); si no la hay, no se pone.
//  - changefreq y priority fuera: Google no los usa.
//  - fichas sin tarjeta verificada y comparativas siguen existiendo y enlazadas, pero no se piden en el sitemap
//    (son plantillas con las mismas cifras de GitHub; ver docs/audits/auditoria-opus-2026-11-12.md, hallazgo M1).
const d = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00.000Z` : iso);
const latest = (dates: string[]) => (dates.length ? d(dates.slice().sort().at(-1)!) : undefined);

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, lastModified?: Date): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
  });

  const posts = getPosts();
  const radar = posts.filter((p) => p.tags.includes("risk-radar"));
  const cardDates = VERIFIED.map((c) => c.reviewedAt);
  const advisoryDates = allAdvisories().flatMap(([, pkgs]) => pkgs.flatMap((p) => p.vulns.map((v) => v.published))).filter(Boolean) as string[];
  const withCard = getAgents().filter((a) => getVerified(a.slug));

  return [
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
    entry("/compare/live"),
    ...(posts.length ? [entry("/blog", latest(posts.map((p) => p.updated))), ...posts.map((p) => entry(`/blog/${p.slug}`, d(p.updated)))] : []),
    ...(snapshotCount >= 2 ? [entry("/changes")] : []),
    entry("/sponsor"),
    entry("/sponsor/terms"),
    ...BEST_PAGES.map((b) => entry(`/best/${b.slug}`)),
    ...CATEGORIES.map((c) => entry(`/categories/${c.slug}`)),
    ...withCard.map((a) => entry(`/agents/${a.slug}`, d(getVerified(a.slug)!.reviewedAt))),
  ];
}
