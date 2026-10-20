import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { ScoreBar, ScoreLegend } from "@/components/score-bar";
import { Eyebrow, FreshChip, LicenseChip } from "@/components/ui-kit";
import { PAIRS, getPair, pairsFor, summaryFor, whoPicks } from "@/lib/compare";
import { fmtDate, getCategory, pagesForAgent } from "@/lib/data";
import { absoluteUrl, OG_IMAGE, clip, fitTitle } from "@/lib/site";

type Props = { params: Promise<{ pair: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => PAIRS.map((p) => ({ pair: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) return {};
  const cat = getCategory(p.category)!;
  const title = fitTitle([`${p.a.name} vs ${p.b.name}: stars, activity and license`, `${p.a.name} vs ${p.b.name}: stars and license`, `${p.a.name} vs ${p.b.name}`]);
  const description = clip(`${p.a.name} vs ${p.b.name} (${cat.name}): ${p.a.score} vs ${p.b.score} of 100, ${p.a.license ?? "no license"} vs ${p.b.license ?? "no license"}. Public GitHub data, checked ${fmtDate(p.a.verifiedAt)}.`);
  return { title, description, alternates: { canonical: `/compare/${p.slug}` }, openGraph: { title, description, type: "article", images: [OG_IMAGE] } };
}

const section = "section space-y-6 ";

export default async function ComparePage({ params }: Props) {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) notFound();
  const cat = getCategory(p.category)!;
  const verified = p.a.verifiedAt > p.b.verifiedAt ? p.a.verifiedAt : p.b.verifiedAt;
  const more = [...new Map([...pairsFor(p.a.slug, 4), ...pairsFor(p.b.slug, 4)].filter((x) => x.slug !== p.slug).map((x) => [x.slug, x])).values()].slice(0, 3);
  const rankings = [...new Map([...pagesForAgent(p.a), ...pagesForAgent(p.b)].map((b) => [b.slug, b])).values()].slice(0, 3);

  return (
    <article>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: cat.name, url: absoluteUrl(`/categories/${cat.slug}`) },
          { name: `${p.a.name} vs ${p.b.name}`, url: absoluteUrl(`/compare/${p.slug}`) },
        ])}
      />
      <nav aria-label="Breadcrumb" className="eyebrow">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <Link href={`/categories/${cat.slug}`} className="transition-colors hover:text-foreground">{cat.name}</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <span aria-current="page">{p.a.name} vs {p.b.name}</span>
      </nav>

      <header className="mt-8 space-y-6">
        <Eyebrow>Compare · {cat.name}</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">{p.a.name} vs {p.b.name}</h1>
        <p data-summary className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-foreground/85">{summaryFor(p, cat.name)}</p>
        <p className="mono-num text-xs text-muted-foreground">Public GitHub API · checked {fmtDate(verified)} · {p.known} data points compared</p>
      </header>

      <section aria-labelledby="facts" className={section}>
        <h2 id="facts" className="display-2 fs-title">Side by side</h2>
        <div className="surface-lg overflow-x-auto p-2 sm:p-3">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/[0.09]">
                <th scope="col" className="px-3 py-3 text-left font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground">Fact</th>
                <th scope="col" className="px-3 py-3 text-left font-medium"><Link href={`/agents/${p.a.slug}`} className="hover:underline">{p.a.name}</Link></th>
                <th scope="col" className="px-3 py-3 text-left font-medium"><Link href={`/agents/${p.b.slug}`} className="hover:underline">{p.b.name}</Link></th>
              </tr>
            </thead>
            <tbody>
              {p.facts.filter((f) => f.known).map((f) => (
                <tr key={f.key} data-fact={f.key} className="border-b border-ink/[0.05] last:border-0">
                  <th scope="row" className="px-3 py-3 text-left text-sm font-normal text-muted-foreground">{f.label}</th>
                  <td className={`mono-num px-3 py-3 ${f.edge === "a" ? "font-medium text-foreground" : "text-foreground/80"}`}>{f.a}</td>
                  <td className={`mono-num px-3 py-3 ${f.edge === "b" ? "font-medium text-foreground" : "text-foreground/80"}`}>{f.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">The brighter value is the better one on that row. Where there is no brighter value, the two are equal or not comparable.</p>
      </section>

      <section aria-labelledby="score" className={section}>
        <h2 id="score" className="display-2 fs-title">Score breakdown</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[p.a, p.b].map((t) => (
            <div key={t.slug} className="surface space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-medium tracking-[-0.035em]">{t.name}</h3>
                <ScoreBar score={t.score} parts={t.parts} wide />
              </div>
              <div className="flex flex-wrap items-center gap-3"><LicenseChip agent={t} /><FreshChip agent={t} /></div>
              {t.description && (
                <p className="prose-measure text-sm text-foreground/85">
                  <span className="text-muted-foreground">Project description (from GitHub): </span>
                  {t.description}
                </p>
              )}
              <p className="text-sm">
                <a href={t.repoUrl} rel="noopener" className="underline underline-offset-4 hover:text-ink">Repository on GitHub</a>
                {t.officialUrl && <> · <a href={t.officialUrl} rel="noopener" className="underline underline-offset-4 hover:text-ink">Website</a></>}
              </p>
            </div>
          ))}
        </div>
        <ScoreLegend />
      </section>

      <section aria-labelledby="who" className={section}>
        <h2 id="who" className="display-2 fs-title">Who should pick which</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {whoPicks(p).map((w) => (
            <div key={w.label} className="surface p-5">
              <dt className="eyebrow">{w.label}</dt>
              <dd className="mt-3 text-foreground/90">{w.text}</dd>
            </div>
          ))}
        </dl>
        <p className="prose-measure text-sm text-muted-foreground">
          These are facts from the data above, not a verdict on quality. Test both on your own task. The score does not
          measure performance, price or integrations (see the <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology</Link>).
        </p>
      </section>

      <section aria-labelledby="more" className={section}>
        <h2 id="more" className="display-2 fs-title">Keep exploring</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {more.map((x) => (
            <li key={x.slug}>
              <Link href={`/compare/${x.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="eyebrow">Compare</span>
                <span className="mt-3 block font-medium tracking-[-0.035em]">{x.a.name} vs {x.b.name}</span>
              </Link>
            </li>
          ))}
          {rankings.map((b) => (
            <li key={b.slug}>
              <Link href={`/best/${b.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="eyebrow">Ranking</span>
                <span className="mt-3 block font-medium tracking-[-0.035em]">{b.h1}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
