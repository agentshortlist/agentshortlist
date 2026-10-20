import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { ScoreBar, ScoreLegend } from "@/components/score-bar";
import { TrustBlock } from "@/components/trust-block";
import { VerifiedCardView } from "@/components/verified-card";
import { getVerified } from "@/content/verified";
import { pairsFor } from "@/lib/compare";
import { Eyebrow, FreshChip, LicenseChip, PillLink } from "@/components/ui-kit";
import {
  fmtDate,
  fmtStars,
  getAgent,
  getAgents,
  getAgentsByCategory,
  getCategory,
  isOpenSource,
  pagesForAgent,
  rank,
} from "@/lib/data";
import { absoluteUrl, clip, fitTitle } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getAgents().map((a) => ({ slug: a.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getAgent(slug);
  if (!a) return {};
  const cat = getCategory(a.category)!;
  const v = getVerified(a.slug);
  return {
    title: v
      ? fitTitle([`${a.name}: permissions, advisories and upkeep`, `${a.name}: permissions and upkeep`, `${a.name}: what it can do`, a.name])
      : fitTitle([`${a.name} (${cat.name}): stars, activity, license`, `${a.name}: stars, activity and license`, `${a.name}: stars and license`, a.name]),
    description: v
      ? clip(`${a.name}: what it can change, what it sends out, open issues and published security advisories, read from its own docs and source on ${fmtDate(v.reviewedAt)}. Every line shows its source.`)
      : clip(`${a.name} (${cat.name}): ${fmtStars(a.stars)} GitHub stars, last push ${fmtDate(a.lastPush)}, license ${a.license ?? "not stated"}. ${a.description ?? ""}`),
    alternates: { canonical: `/agents/${a.slug}` },
  };
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const a = getAgent(slug);
  if (!a) notFound();
  const cat = getCategory(a.category)!;
  const guides = pagesForAgent(a);
  const compares = pairsFor(a.slug);
  const ranked = rank(getAgentsByCategory(a.category));
  const position = ranked.findIndex((r) => r.slug === a.slug);
  const me = ranked[position];
  const verified = getVerified(a.slug);

  const facts: [string, string][] = [
    ["GitHub stars", fmtStars(a.stars)],
    ["Last push", fmtDate(a.lastPush)],
    ["License", a.license ?? "Not stated on GitHub"],
    ["Pricing", a.pricingModel ?? "Not verified"],
    ["Verified", fmtDate(a.verifiedAt)],
    ["Rank in category", `${position + 1} of ${ranked.length}`],
  ];

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: a.name,
          description: a.description ?? undefined,
          url: absoluteUrl(`/agents/${a.slug}`),
          applicationCategory: "DeveloperApplication",
          ...(a.lastPush ? { dateModified: a.lastPush } : {}),
          ...(isOpenSource(a) && a.license ? { license: `https://spdx.org/licenses/${a.license}` } : {}),
          sameAs: [a.repoUrl, ...(a.officialUrl ? [a.officialUrl] : [])],
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: cat.name, url: absoluteUrl(`/categories/${cat.slug}`) },
          { name: a.name, url: absoluteUrl(`/agents/${a.slug}`) },
        ])}
      />
      <nav aria-label="Breadcrumb" className="eyebrow">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <Link href={`/categories/${cat.slug}`} className="transition-colors hover:text-foreground">{cat.name}</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <span aria-current="page">{a.name}</span>
      </nav>

      <header className="space-y-6">
        <Eyebrow>{cat.name}</Eyebrow>
        <h1 className="display-2 reveal fs-title">{a.name}</h1>
        <div className="reveal reveal-1 flex flex-wrap items-center gap-3">
          <LicenseChip agent={a} />
          <FreshChip agent={a} />
        </div>
        {a.description && (
          <p className="reveal reveal-2 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
            <span className="block pb-1 text-sm text-muted-foreground">Project description (from GitHub)</span>
            {a.description}
          </p>
        )}
        <div className="reveal reveal-3 flex flex-wrap gap-3">
          <PillLink href={a.repoUrl}>View on GitHub</PillLink>
          {a.officialUrl && <PillLink href={a.officialUrl} variant="soft">Official website</PillLink>}
        </div>
      </header>

      <section aria-labelledby="signals" className="section space-y-8 ">
        <h2 id="signals" className="display-2 fs-title">Signals</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k} className="surface p-5">
              <dt className="eyebrow">{k}</dt>
              <dd className="mono-num mt-3 text-lg">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="surface-lg space-y-4 p-6">
          <p className="eyebrow">GitHub signals score in {cat.name}</p>
          <ScoreBar score={me.score} parts={me.parts} wide />
          <ScoreLegend />
        </div>
        <p className="text-sm text-muted-foreground">
          Data source: public GitHub API, checked {fmtDate(a.verifiedAt)}. The score compares tools within this category only and measures popularity, recent activity and license, not performance.
        </p>
      </section>

      {verified && <VerifiedCardView card={verified} />}

      <TrustBlock agent={a} categoryRank={position + 1} categorySize={ranked.length} score={me.score} />

      {compares.length > 0 && (
        <section aria-labelledby="cmp" className="section space-y-6 ">
          <h2 id="cmp" className="display-2 fs-title">Compare with</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {compares.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="eyebrow">Compare</span>
                  <span className="mt-3 block font-medium tracking-[-0.035em]">{c.a.name} vs {c.b.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guides.length > 0 && (
        <section aria-labelledby="alt" className="section space-y-6 ">
          <h2 id="alt" className="display-2 fs-title">Compare alternatives</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {guides.map((b) => (
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
    </article>
  );
}
