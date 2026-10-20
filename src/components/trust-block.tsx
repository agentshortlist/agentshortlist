import { Sparkline } from "@/components/sparkline";
import { fmtDate, fmtStars, type Agent } from "@/lib/data";
import { CORRECTIONS_EMAIL } from "@/lib/site";
import { rankSeries, snapshotsFor, starSeries, trackedSince } from "@/lib/history";

const NOT_VERIFIED = [
  ["Pricing", "'Open source' describes the license, not what it costs to run."],
  ["Integrations", "No integration list has been checked against a source."],
  ["Deployment options", "Self-hosted, cloud and managed options have not been confirmed."],
  ["Data handling and privacy", "No privacy or retention claim has been verified."],
] as const;

// Separa lo comprobado (API pública de GitHub, con fecha) de lo que no lo está. Nada de "TBD".
export function TrustBlock({ agent, categoryRank, categorySize, score }: { agent: Agent; categoryRank: number; categorySize: number; score: number }) {
  const since = trackedSince(agent.slug);
  const n = snapshotsFor(agent.slug);
  const stars = starSeries(agent.slug);
  const ranks = rankSeries(agent.slug);
  const checked = fmtDate(agent.verifiedAt);
  const verified: [string, string][] = [
    ["Stars", fmtStars(agent.stars)],
    ["Last push", fmtDate(agent.lastPush)],
    ["License", agent.license ?? "None detected by GitHub"],
    ["Rank in category", `${categoryRank} of ${categorySize}`],
    ["Score", `${score} of 100`],
  ];
  return (
    <section aria-labelledby="evidence" className="section space-y-8 ">
      <div className="space-y-3">
        <p className="eyebrow">Evidence</p>
        <h2 id="evidence" className="display-2 fs-title">What we verified, and what we did not.</h2>
        <p className="mono-num text-xs text-muted-foreground">
          {since ? `Tracking since ${since} · ${n} snapshot${n === 1 ? "" : "s"}` : "Not tracked yet"}
          {n < 3 ? " · trend charts appear after 3 snapshots" : ""}
        </p>
      </div>

      {n >= 3 && (
        <div className="flex flex-wrap gap-10">
          <Sparkline points={stars} label="GitHub stars over time" format={fmtStars} />
          <Sparkline points={ranks} label="Rank in category (higher is better)" invert format={(v) => `#${v}`} />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="surface p-5">
          <p className="eyebrow">Verified</p>
          <dl className="mt-4 space-y-3 text-sm">
            {verified.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mono-num text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Source: public GitHub API, checked {checked}.</p>
        </div>
        <div className="rounded-xl border border-dashed border-ink/25 p-5">
          <p className="eyebrow">Not verified</p>
          <dl className="mt-4 space-y-3 text-sm">
            {NOT_VERIFIED.map(([k, why]) => (
              <div key={k}>
                <dt className="font-medium tracking-[-0.02em]">{k}</dt>
                <dd className="text-muted-foreground">{why}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            A field moves to Verified only when it comes from the GitHub API or from a primary source with a link and a date.
            Spot an error or have a source?{" "}
            <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
