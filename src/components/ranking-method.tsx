import Link from "next/link";
import {
  RECENCY_WINDOW_DAYS,
  WEIGHTS,
  fmtDate,
  fmtStars,
  getCategory,
  type BestPage,
  type Ranked,
} from "@/lib/data";
import { CORRECTIONS_EMAIL } from "@/lib/site";

const pts = (n: number) => n.toFixed(1);

// Metodología y fuentes de un ranking: reglas de entrada, cuenta del primero, fuente de cada herramienta y límites.
// Todo se calcula con los mismos datos y la misma fórmula que ordenan la tabla.
export function RankingMethod({ page, ranked, noun, updated }: { page: BestPage; ranked: Ranked[]; noun: string; updated: string }) {
  const cats = page.select.categories.map((c) => getCategory(c)?.name ?? c);
  const first = ranked[0];
  const maxStars = Math.max(...ranked.map((a) => a.stars ?? 0));
  return (
    <section aria-labelledby="criteria" className="section space-y-8 " data-method>
      <div className="space-y-4">
        <h2 id="criteria" className="display-2 fs-title">Methodology and sources</h2>
        <p className="prose-measure text-[15px] leading-[1.65] text-muted-foreground">
          What is in this ranking, how the score is built, and where every number comes from. Anyone can repeat the calculation.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="display text-5xl">{WEIGHTS.stars}<span className="text-xl text-muted-foreground"> pts</span></p>
          <p className="text-sm text-muted-foreground">GitHub stars, log-scaled against the strongest tool in this list.</p>
        </div>
        <div className="space-y-2">
          <p className="display text-5xl">{WEIGHTS.recency}<span className="text-xl text-muted-foreground"> pts</span></p>
          <p className="text-sm text-muted-foreground">Recency of the last push: full marks today, zero at {RECENCY_WINDOW_DAYS} days.</p>
        </div>
        <div className="space-y-2">
          <p className="display text-5xl">{WEIGHTS.license}<span className="text-xl text-muted-foreground"> pts</span></p>
          <p className="text-sm text-muted-foreground">An open-source license detected by GitHub.</p>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="surface p-5">
          <dt className="eyebrow">What is included</dt>
          <dd className="mt-3 space-y-2 text-sm text-foreground/90">
            <p>
              {ranked.length} {noun} from the {cats.join(" and ")} {cats.length > 1 ? "categories" : "category"}
              {page.select.openSourceOnly ? ", only those with an open-source license" : ""}.
            </p>
            <p>
              A tool is listed only if its GitHub repository is not archived, was pushed within the last {RECENCY_WINDOW_DAYS} days
              and has an English description. Anything that fails is removed, however popular.
            </p>
          </dd>
        </div>
        {first && (
          <div className="surface p-5">
            <dt className="eyebrow">Worked example: {first.name}</dt>
            <dd className="mono-num mt-3 space-y-1 text-sm text-foreground/90">
              <p>Stars: {fmtStars(first.stars)} of {fmtStars(maxStars)} at the top = {pts(first.parts.stars)} / {WEIGHTS.stars}</p>
              <p>Last push {fmtDate(first.lastPush)} = {pts(first.parts.recency)} / {WEIGHTS.recency}</p>
              <p>License {first.license ?? "not stated"} = {pts(first.parts.license)} / {WEIGHTS.license}</p>
              <p className="pt-1 text-foreground">Total {first.score} / 100</p>
            </dd>
          </div>
        )}
      </dl>

      <div className="space-y-3">
        <h3 className="text-lg font-medium tracking-[-0.035em]">Sources for each tool</h3>
        <p className="prose-measure text-sm text-muted-foreground">
          Stars, last push, license, archived status and description are read from the public GitHub REST API
          (<code className="text-foreground/80">api.github.com/repos/owner/name</code>). Nothing is estimated: a missing value is shown as not stated.
          Data refreshed automatically every day; the data of this ranking is from {fmtDate(updated)}.
        </p>
        <details className="surface p-5">
          <summary className="cursor-pointer text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Show the {ranked.length} sources
          </summary>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/[0.09] text-left text-xs text-muted-foreground">
                  <th scope="col" className="py-2 pr-3 font-normal">Tool</th>
                  <th scope="col" className="py-2 pr-3 font-normal">Repository</th>
                  <th scope="col" className="py-2 pr-3 font-normal">API record</th>
                  <th scope="col" className="py-2 font-normal">Checked</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((a) => (
                  <tr key={a.slug} className="border-b border-ink/[0.05] last:border-0">
                    <td className="py-2 pr-3">
                      <Link href={`/agents/${a.slug}`} className="underline-offset-4 hover:underline">{a.name}</Link>
                    </td>
                    <td className="py-2 pr-3">
                      <a href={a.repoUrl} rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                        {a.repoUrl.replace("https://github.com/", "")}
                      </a>
                    </td>
                    <td className="py-2 pr-3">
                      {a.sources[0] ? (
                        <a href={a.sources[0]} rel="noopener" className="underline underline-offset-4 hover:text-foreground">JSON</a>
                      ) : (
                        <span className="text-muted-foreground">n/a</span>
                      )}
                    </td>
                    <td className="mono-num py-2 text-muted-foreground">{fmtDate(a.verifiedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <p className="prose-measure text-sm text-muted-foreground">
        This is a signal-based ranking of {noun}, not a test of output quality: it favors open-source licenses and says nothing about price,
        security or results on your task. Full rules on the{" "}
        <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology page</Link>. Found a mistake?{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>.
      </p>
    </section>
  );
}
