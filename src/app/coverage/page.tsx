import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { EXCLUDED, categoryRows, overallMix } from "@/lib/coverage";
import { BEST_PAGES, fmtDate, getAgents } from "@/lib/data";
import { REASON_TEXT } from "@/lib/history";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Coverage: what we track and what we skip",
  description: "How many tools each category covers, how many have an open-source license, which were excluded and why, and what the site does not track.",
  alternates: { canonical: "/coverage" },
};

const th = "px-3 py-3 text-left font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground";

export default function CoveragePage() {
  const mix = overallMix();
  const rows = categoryRows();
  const verified = getAgents().map((a) => a.verifiedAt).sort().at(-1)!;
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Coverage</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">What we cover, and what we do not.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          {mix.total} tools in {rows.length} categories, every one a public GitHub repository. {mix.osi} of {mix.total} carry an
          open-source license. Closed-source and commercial products are not tracked. Data checked {fmtDate(verified)}.
        </p>
      </header>

      <section aria-labelledby="bias" className="section space-y-5 ">
        <h2 id="bias" className="display-2 fs-title">A bias you should know about</h2>
        <p className="prose-measure text-foreground/85">
          Because every listed tool is a public repository and the score gives 20 of 100 points to an open-source license,
          open-source projects have a built-in advantage here, and commercial products cannot be ranked fairly with this
          formula. The rankings tell you which open projects are popular, active and openly licensed. They do not tell you
          which product is best for your job, and they do not cover paid software.
        </p>
      </section>

      <section aria-labelledby="by-cat" className="section space-y-6 ">
        <h2 id="by-cat" className="display-2 fs-title">By category</h2>
        <div className="surface-lg overflow-x-auto p-2 sm:p-3">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/[0.09]">
                <th scope="col" className={th}>Category</th>
                <th scope="col" className={`${th} text-right`}>Tools</th>
                <th scope="col" className={`${th} text-right`}>OSI license</th>
                <th scope="col" className={`${th} text-right`}>Other license</th>
                <th scope="col" className={`${th} text-right`}>None detected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ category, mix: m }) => (
                <tr key={category.slug} className="border-b border-ink/[0.05] last:border-0">
                  <td className="px-3 py-3"><Link href={`/categories/${category.slug}`} className="font-medium tracking-[-0.02em] hover:underline">{category.name}</Link></td>
                  <td className="mono-num px-3 py-3 text-right" data-cov={`${category.slug}:total`}>{m.total}</td>
                  <td className="mono-num px-3 py-3 text-right" data-cov={`${category.slug}:osi`}>{m.osi}</td>
                  <td className="mono-num px-3 py-3 text-right" data-cov={`${category.slug}:other`}>{m.other}</td>
                  <td className="mono-num px-3 py-3 text-right" data-cov={`${category.slug}:none`}>{m.notStated}</td>
                </tr>
              ))}
              <tr className="border-t border-ink/[0.15]">
                <td className="px-3 py-3 font-medium">All categories</td>
                <td className="mono-num px-3 py-3 text-right" data-cov="all:total">{mix.total}</td>
                <td className="mono-num px-3 py-3 text-right" data-cov="all:osi">{mix.osi}</td>
                <td className="mono-num px-3 py-3 text-right" data-cov="all:other">{mix.other}</td>
                <td className="mono-num px-3 py-3 text-right" data-cov="all:none">{mix.notStated}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="prose-measure text-sm text-muted-foreground">
          &ldquo;OSI license&rdquo; means a standard open-source license detected by GitHub. &ldquo;Other license&rdquo; is a license
          that GitHub recognizes but that is not on our open-source list{mix.otherNames.length ? ` (${mix.otherNames.join(", ")})` : ""}.
          {mix.notStatedNames.length ? ` No license detected: ${mix.notStatedNames.join(", ")}.` : ""} A tool with no detected license is not necessarily closed: check the project&apos;s own terms.
        </p>
      </section>

      <section aria-labelledby="excluded" className="section space-y-5 ">
        <h2 id="excluded" className="display-2 fs-title">Excluded and why</h2>
        <p className="prose-measure text-sm text-muted-foreground">
          A tool is listed only if its repository is not archived, was pushed in the last 90 days and has an English description on GitHub.
        </p>
        {EXCLUDED.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {EXCLUDED.map((e) => (
              <li key={e.repo} className="surface p-5 text-sm">
                <p className="font-medium tracking-[-0.02em]">{e.name}</p>
                <p className="mt-1 text-muted-foreground">{REASON_TEXT[e.reason] ?? e.reason}{e.daysSincePush ? ` · ${e.daysSincePush} days since the last push` : ""}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-foreground/85">No candidate is excluded right now.</p>}
      </section>

      <section aria-labelledby="not-tracked" className="section space-y-5 ">
        <h2 id="not-tracked" className="display-2 fs-title">What we do not track</h2>
        <ul className="prose-measure list-disc space-y-2 pl-5 text-foreground/85">
          <li>Closed-source and commercial products, and services without a public repository.</li>
          <li>Performance. The rankings use public popularity and maintenance signals, not hands-on tests.</li>
          <li>Pricing, integrations, deployment options and data handling. Each tool page says these are not verified.</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          {BEST_PAGES.length} rankings use this data; each one states its own scope. Method details are on the{" "}
          <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology page</Link>. Spot an error or know
          a tool we should check? Write to{" "}
          <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>.
        </p>
      </section>
    </div>
  );
}
