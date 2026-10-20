import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { REASON_TEXT, changesSince, firstDate, history, latestDate, nameOf, snapshotCount } from "@/lib/history";
import { getCategory, fmtStars } from "@/lib/data";
import type { Diff } from "@/lib/history-core";

// Con un solo registro no hay nada que comparar: la página existe pero no se indexa hasta tener al menos dos.
const hasHistory = snapshotCount >= 2;

export const metadata: Metadata = {
  title: "What changed in AI agent rankings",
  description: "Tools that entered or left, license changes, star gains and rank movement, from dated snapshots of public GitHub data.",
  alternates: { canonical: "/changes", types: { "application/atom+xml": "/changes/feed.xml" } },
  robots: hasHistory ? undefined : { index: false, follow: true },
};

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="surface p-5">
    <p className="eyebrow">{title}</p>
    <div className="mt-3 text-sm text-foreground/90">{children}</div>
  </div>
);
const None = () => <span className="text-muted-foreground">None.</span>;

function Window({ days }: { days: number }) {
  const w = changesSince(days);
  if (!w) return null;
  const d: Diff = w.diff;
  const snapTo = history[w.to];
  const shorter = w.spanDays < w.requested;
  return (
    <section aria-labelledby={`w${days}`} className="section space-y-6 ">
      <div className="space-y-2">
        <h2 id={`w${days}`} className="display-2 fs-title">Last {days} days</h2>
        <p className="mono-num text-xs text-muted-foreground">
          {w.from} → {w.to} · {w.spanDays} day{w.spanDays === 1 ? "" : "s"} of history
          {shorter ? ` (shorter than ${days}: tracking started on ${firstDate})` : ""}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Group title="Entered">
          {d.entered.length ? <ul className="space-y-1">{d.entered.map((s) => <li key={s}><Link className="underline underline-offset-4" href={`/agents/${s}`}>{nameOf(s, snapTo)}</Link></li>)}</ul> : <None />}
        </Group>
        <Group title="Left">
          {d.left.length ? (
            <ul className="space-y-1">
              {d.left.map((l) => (
                <li key={l.slug}>{nameOf(l.slug, snapTo)}: {REASON_TEXT[l.reason] ?? l.reason}{l.daysSincePush ? ` (${l.daysSincePush} days)` : ""}</li>
              ))}
            </ul>
          ) : <None />}
        </Group>
        <Group title="License changes">
          {d.licenseChanges.length ? <ul className="space-y-1">{d.licenseChanges.map((c) => <li key={c.slug}>{nameOf(c.slug, snapTo)}: {c.from ?? "not stated"} → {c.to ?? "not stated"}</li>)}</ul> : <None />}
        </Group>
        <Group title="Biggest star gains">
          {d.starGains.length ? <ul className="space-y-1">{d.starGains.slice(0, 8).map((g) => <li key={g.slug} className="mono-num">{nameOf(g.slug, snapTo)}: {g.delta > 0 ? "+" : ""}{fmtStars(g.delta)}</li>)}</ul> : <None />}
        </Group>
      </div>
      <Group title="Rank movement inside each category">
        {d.rankMoves.length ? (
          <ul className="space-y-1">
            {d.rankMoves.slice(0, 12).map((m) => (
              <li key={`${m.category}-${m.slug}`}>
                {nameOf(m.slug, snapTo)}: #{m.from} → #{m.to} in {getCategory(m.category)?.name ?? m.category}
              </li>
            ))}
          </ul>
        ) : <None />}
      </Group>
    </section>
  );
}

export default function ChangesPage() {
  const latest = history[latestDate];
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Changes</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">What changed.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Dated snapshots of public GitHub signals, compared over time. Nothing here is reconstructed: every value comes from
          a snapshot we stored on the day shown.
        </p>
        <p className="mono-num text-xs text-muted-foreground">
          Tracking since {firstDate} · {snapshotCount} snapshot{snapshotCount === 1 ? "" : "s"} ·{" "}
          <Link href="/changes/feed.xml" className="underline underline-offset-4 hover:text-foreground">Atom feed</Link>
        </p>
      </header>

      {!hasHistory && (
        <section aria-labelledby="empty" className="section space-y-4 ">
          <h2 id="empty" className="display-2 fs-title">Nothing to compare yet.</h2>
          <p className="prose-measure text-foreground/85">
            The first snapshot is from {firstDate}. Changes appear after the next one, and we never estimate what happened
            before tracking began.
          </p>
        </section>
      )}

      {hasHistory && (
        <>
          <Window days={7} />
          <Window days={30} />
        </>
      )}

      <section aria-labelledby="left-out" className="section space-y-5 ">
        <h2 id="left-out" className="display-2 fs-title">Left out of the latest snapshot</h2>
        <p className="prose-measure text-sm text-muted-foreground">Snapshot of {latestDate}. A tool is listed only if its repository is not archived and was pushed in the last 90 days.</p>
        {latest.excluded.length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {latest.excluded.map((e) => (
              <li key={e.slug} className="surface p-5 text-sm">
                <p className="font-medium tracking-[-0.02em]">{e.name}</p>
                <p className="mt-1 text-muted-foreground">{REASON_TEXT[e.reason] ?? e.reason}{e.daysSincePush ? ` · ${e.daysSincePush} days since the last push` : ""}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-foreground/85">No candidate was excluded in this snapshot.</p>}
        <p className="text-sm text-muted-foreground">
          How the data is collected is explained on the <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology page</Link>.
        </p>
      </section>
    </div>
  );
}
