import type { Metadata } from "next";
import Link from "next/link";
import { BEST_PAGES, RECENCY_WINDOW_DAYS, WEIGHTS, agentsForPage } from "@/lib/data";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Methodology: How AgentShortlist Ranks AI Agents",
  description:
    "Exactly how AgentShortlist selects and scores AI agents: public GitHub signals, fixed weights, a recency rule and clearly separated sponsorship.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <article className="max-w-3xl space-y-6 [&_p]:text-foreground/85 [&_li]:text-foreground/85">
      <p className="eyebrow">How we rank</p>
      <h1 className="display-2 fs-title">Methodology</h1>
      <p className="text-[15px] leading-[1.65] text-muted-foreground">
        Every ranking on AgentShortlist uses the same public rules, so you can check the result yourself.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Inclusion rule</h2>
      <p>
        A tool is listed only if its GitHub repository is not archived, was pushed within the last{" "}
        {RECENCY_WINDOW_DAYS} days and has an English description. Tools that fail these rules are removed, however popular they are.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Score (0-100)</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>{WEIGHTS.stars} points: GitHub stars, log-scaled against the strongest tool in the same list.</li>
        <li>{WEIGHTS.recency} points: recency of the last push, linear from full marks (today) to zero ({RECENCY_WINDOW_DAYS} days).</li>
        <li>{WEIGHTS.license} points: an open-source license detected by GitHub (MIT, Apache-2.0, BSD, GPL, AGPL, MPL, ISC).</li>
      </ul>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">How to read a score</h2>
      <p>
        The score is an index of GitHub signals: stars, recent activity and license. It is not a quality rating. Stars are
        scaled against the strongest tool in the list being shown, so a score in one ranking or category cannot be compared
        with a score in another. The signal map is the exception: it uses one global reference across all tools and says so.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Data and limits</h2>
      <p>
        Stars, last push, license and description come from the public GitHub API. When a value is unavailable we
        show it as not stated instead of guessing. The score measures popularity, maintenance and openness. It does
        not measure how well a tool performs on your task, so test shortlisted tools on your own work.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Rules and sources of each ranking</h2>
      <p>
        Each ranking page ends with its own methodology block: what it includes, a worked example of the score for the
        number one tool, and a link to the GitHub record behind every tool.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        {BEST_PAGES.map((b) => (
          <li key={b.slug}>
            <Link href={`/best/${b.slug}#criteria`} className="underline underline-offset-4 hover:text-foreground">{b.h1}</Link>
            <span className="text-muted-foreground"> · {agentsForPage(b).length} tools{b.select.openSourceOnly ? ", open-source only" : ""}</span>
          </li>
        ))}
      </ul>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">What the score does not measure</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>How well a tool performs on your task: nothing here is a hands-on test.</li>
        <li>Price, integrations, deployment options or data handling: each tool page lists them as not verified.</li>
        <li>Quality of the code or the documentation, and the size or health of its community beyond stars and recent pushes.</li>
      </ul>
      <h2 id="verified-cards" className="display-2 scroll-mt-28 pt-6 text-2xl sm:text-3xl">Verified cards</h2>
      <p>
        A small number of tools have a verified card: a page section we filled in by hand from the project&apos;s own
        documentation and source code. Each line shows its origin: official docs, GitHub, our recommendation, or not verified.
        If we could not check something, we say so instead of guessing. A card is not a security audit and not a hands-on test.
        It states what the project says and what its code shows on the review date and version shown.
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Tools: counted from the README or the server source, as stated on each card. Token weight is not measured yet.</li>
        <li>Open issues older than 90 days: counted from the GitHub issue tracker on the review date.</li>
        <li>Maintenance wording: &quot;active&quot; means a push in the last 30 days; &quot;low activity&quot; means 31 to 90 days.</li>
        <li>Configuration snippets come from the project&apos;s documentation. Where one is our own suggestion, it is labeled as such.</li>
      </ul>
      <h2 id="advisories" className="display-2 scroll-mt-28 pt-6 text-2xl sm:text-3xl">Security advisories, pickers and the config checker</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Advisories come from OSV.dev. We include a package only after confirming on npm, PyPI or Go that it belongs to the same repository
          as the card. &quot;No advisory&quot; means none is published, not that the package is safe.
        </li>
        <li>The picker filters verified cards by documented facts. &quot;Not verified&quot; never counts as meeting a condition. It does not rank.</li>
        <li>The comparator shows the card fields side by side, with no score.</li>
        <li>
          The config checker runs in your browser and sends nothing. It flags documented options missing from your configuration and compares a
          pinned version with advisory ranges. The version match is approximate.
        </li>
      </ul>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">A bias toward open source</h2>
      <p>
        Every listed tool is a public GitHub repository and {WEIGHTS.license} of the 100 points reward an open-source license.
        Open-source projects therefore have a built-in advantage, and commercial products cannot be ranked fairly with
        this formula. See the <Link href="/coverage" className="underline underline-offset-4 hover:text-foreground">coverage page</Link> for the exact numbers.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">How history is stored</h2>
      <p>
        Each time the data is refreshed we store one dated snapshot of the raw signals: stars, last push, license and whether
        the repository is archived. Scores are recomputed from those signals with the formula above. We never backfill or
        estimate past values, so history starts on the date of the first snapshot. Changes are on the{" "}
        <Link href="/changes" className="underline underline-offset-4 hover:text-foreground">changes page</Link> and in its Atom feed.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Corrections</h2>
      <p>
        Spot an error or have a primary source for a field we list as not verified? Write to{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>.
      </p>
      <h2 className="display-2 pt-6 text-2xl sm:text-3xl">Sponsorship</h2>
      <p>
        Paid placements, when they exist, will be labeled and shown separately. They never change a tool&apos;s score
        or position in a ranking.
      </p>
    </article>
  );
}
