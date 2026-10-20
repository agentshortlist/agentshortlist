import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AgentTable } from "@/components/agent-table";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { ScoreBar, ScoreLegend } from "@/components/score-bar";
import { RankingMethod } from "@/components/ranking-method";
import { ScopeBlock } from "@/components/scope-block";
import { SponsoredSlot } from "@/components/sponsored-slot";
import { FaqList } from "@/components/faq-list";
import { Eyebrow, FreshChip, LicenseChip } from "@/components/ui-kit";
import {
  BEST_PAGES,
  bestPageContent,
  fmtDate,
  fmtStars,
  getBestPage,
  getCategory,
} from "@/lib/data";
import { absoluteUrl, clip, fitTitle } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const revalidate = 600;
export const generateStaticParams = () => BEST_PAGES.map((b) => ({ slug: b.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getBestPage(slug);
  if (!page) return {};
  const title = fitTitle([page.title, `${page.h1}, Ranked`, page.h1]);
  return {
    title,
    description: clip(page.description),
    alternates: { canonical: `/best/${page.slug}` },
    openGraph: { title, description: clip(page.description), type: "article" },
  };
}

const section = "section space-y-8 ";

export default async function BestPageRoute({ params }: Props) {
  const { slug } = await params;
  const page = getBestPage(slug);
  if (!page) notFound();
  const { noun, ranked, summary, who, faq, updated } = bestPageContent(page);
  const primaryCat = getCategory(page.select.categories[0])!;
  const related = page.related.map((r) => getBestPage(r)!);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: page.h1,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: ranked.length,
          itemListElement: ranked.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/agents/${a.slug}`),
            name: a.name,
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: page.h1, url: absoluteUrl(`/best/${page.slug}`) },
        ])}
      />

      <nav aria-label="Breadcrumb" className="eyebrow">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <span aria-current="page">{page.h1}</span>
      </nav>

      <header className="mt-8 space-y-6">
        <Eyebrow>Ranking · {noun}</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">{page.h1}</h1>
        <p data-summary className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-foreground/85">{summary}</p>
        <p className="reveal reveal-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="mono-num rounded-md bg-ink/[0.06] px-2 py-1 text-xs text-foreground/80">
            Last updated: <time dateTime={updated}>{fmtDate(updated)}</time>
          </span>
          <span>{ranked.length} tools</span>
          <span>Written for {page.audience}.</span>
        </p>
      </header>

      <div className="mt-10">
        <SponsoredSlot />
      </div>

      <section aria-labelledby="table" className={section}>
        <h2 id="table" className="display-2 fs-title">Comparison table</h2>
        <AgentTable agents={ranked} showScore />
      </section>

      <section aria-labelledby="ranked" className={section}>
        <h2 id="ranked" className="display-2 fs-title">Ranked list</h2>
        <ol className="space-y-3">
          {ranked.map((a, i) => (
            <li key={a.slug} className="surface space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="flex items-baseline gap-4">
                  <span className="mono-num text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-xl font-medium tracking-[-0.035em]">
                    <Link href={`/agents/${a.slug}`} className="underline-offset-4 hover:underline">{a.name}</Link>
                  </h3>
                </div>
                <ScoreBar score={a.score} parts={a.parts} wide />
              </div>
              {a.description && (
                <p className="prose-measure text-foreground/85">
                  <span className="text-sm text-muted-foreground">Project description (from GitHub): </span>
                  {a.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <LicenseChip agent={a} />
                <FreshChip agent={a} />
                <span className="mono-num text-xs text-muted-foreground">
                  {fmtStars(a.stars)} stars · last push {fmtDate(a.lastPush)}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <ScoreLegend />
      </section>

      <ScopeBlock list={ranked} noun={noun} updated={updated} />

      <section aria-labelledby="who" className={section}>
        <h2 id="who" className="display-2 fs-title">Who should pick which</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {who.map((w) => (
            <div key={w.label} className="surface p-5">
              <dt className="eyebrow">{w.label}</dt>
              <dd className="mt-3 text-foreground/90">{w.text}</dd>
            </div>
          ))}
        </dl>
        <p className="prose-measure text-sm text-muted-foreground">
          These are facts from the data above, not a verdict on quality. Test your top two on your own task.
        </p>
      </section>

      <RankingMethod page={page} ranked={ranked} noun={noun} updated={updated} />

      <section aria-labelledby="faq" className={section}>
        <h2 id="faq" className="display-2 fs-title">Frequently asked questions</h2>
        <FaqList items={faq} />
      </section>


      <section aria-labelledby="more" className={section}>
        <h2 id="more" className="display-2 fs-title">More rankings</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {related.map((b) => (
            <li key={b.slug}>
              <Link href={`/best/${b.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="eyebrow">Ranking</span>
                <span className="mt-3 block font-medium tracking-[-0.035em]">{b.h1}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/categories/${primaryCat.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="eyebrow">Category</span>
              <span className="mt-3 block font-medium tracking-[-0.035em]">All {primaryCat.name}</span>
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
