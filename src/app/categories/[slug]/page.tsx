import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AgentTable } from "@/components/agent-table";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { Eyebrow } from "@/components/ui-kit";
import { pairsInCategory } from "@/lib/compare";
import { BEST_PAGES, CATEGORIES, getAgentsByCategory, getCategory, rank } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => CATEGORIES.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  return {
    title: `${cat.name}: Ranked List`,
    description: `${cat.blurb} Ranked by GitHub stars, recent activity and license.`,
    alternates: { canonical: `/categories/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();
  const ranked = rank(getAgentsByCategory(slug));
  const pairs = pairsInCategory(slug);
  const best = BEST_PAGES.filter((b) => b.select.categories.includes(slug));

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: cat.name,
          numberOfItems: ranked.length,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          itemListElement: ranked.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.name, url: absoluteUrl(`/agents/${a.slug}`) })),
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: cat.name, url: absoluteUrl(`/categories/${cat.slug}`) },
        ])}
      />
      <nav aria-label="Breadcrumb" className="eyebrow">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <span aria-current="page">{cat.name}</span>
      </nav>
      <header className="space-y-5">
        <Eyebrow>Category · {ranked.length} tools</Eyebrow>
        <h1 className="display-2 reveal fs-title">{cat.name}</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">{cat.blurb}</p>
      </header>
      <AgentTable agents={ranked} showScore />
      {pairs.length > 0 && (
        <section className="section space-y-5 ">
          <h2 className="display-2 fs-title">Compare the top tools</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pairs.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className="surface surface-hover block p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="eyebrow">Compare</span>
                  <span className="mt-3 block font-medium tracking-[-0.035em]">{c.a.name} vs {c.b.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {best.length > 0 && (
        <section className="section space-y-5 ">
          <h2 className="display-2 fs-title">Ranked guides</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {best.map((b) => (
              <li key={b.slug}>
                <Link href={`/best/${b.slug}`} className="surface surface-hover block p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="eyebrow">Ranking</span>
                  <span className="mt-3 block font-medium tracking-[-0.035em]">{b.h1}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
