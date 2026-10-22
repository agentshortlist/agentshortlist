import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { VERIFIED, type VerifiedCard } from "@/content/verified";
import { fmtDate, getAgent } from "@/lib/data";
import { RiskBoard } from "@/components/risk-board";
import { cardViews } from "@/lib/verified-view";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Verified MCP cards: permissions and upkeep",
  description:
    "MCP servers read from their own docs and source: what each can change, how well it is kept up, how to limit it. Every line shows its source.",
  alternates: { canonical: "/verified" },
};

const th = "px-3 py-3 text-left font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground";
const row = (c: VerifiedCard, group: "context" | "maintenance", label: string) =>
  c[group].find((r) => r.label === label)?.value ?? "Not verified";

export default function VerifiedPage() {
  const cards = VERIFIED.map((c) => ({ c, a: getAgent(c.slug) })).filter((x) => x.a);
  const withAlt = cards.filter((x) => x.c.alternative);
  const withHardening = cards.filter((x) => x.c.hardening.length > 0);
  const views = cardViews();
  const view = (slug: string) => views.find((v) => v.slug === slug);
  const latest = VERIFIED.map((c) => c.reviewedAt).sort().at(-1)!;
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Verified cards</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">What each MCP server can do, read from its own docs.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          {cards.length} servers so far. For each one we read the project&apos;s documentation and source and wrote down what it
          can change, what it sends out, how well it is maintained and how to limit it. Every line shows where it comes from, and
          anything we could not check says so. Last review {fmtDate(latest)}. This is not a security audit.{" "}
          <Link href="/methodology#verified-cards" className="underline underline-offset-4 hover:text-foreground">How cards work</Link>.
        </p>
      </header>

      <section aria-labelledby="map" className="section space-y-6">
        <h2 id="map" className="display-2 fs-title">Which servers carry the least risk?</h2>
        <p className="prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Popularity says little about whether a server is safe to install. This board separates how well a project is kept up from how much
          could go wrong, using only what its card documents. Click any name to open its card.
        </p>
        <RiskBoard cards={views} />
      </section>

      <section aria-labelledby="list" className="section space-y-6">
        <h2 id="list" className="display-2 fs-title">The cards</h2>
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-ink/10">
                <th className={th}>Server</th>
                <th className={th}>Health</th>
                <th className={th}>Risk</th>
                <th className={th}>Tools</th>
                <th className={th}>Last push</th>
                <th className={th}>Open issues</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(({ c, a }) => (
                <tr key={c.slug} className="border-b border-ink/10 align-top last:border-0">
                  <td className="px-3 py-3 font-medium">
                    <Link href={`/agents/${c.slug}`} className="underline-offset-4 hover:underline">{a!.name}</Link>
                  </td>
                  <td className="px-3 py-3 text-foreground/85">{view(c.slug)?.health.level ?? "n/a"}</td>
                  <td className="px-3 py-3 text-foreground/85">{view(c.slug) ? `${view(c.slug)!.risk.level}${view(c.slug)!.risk.limited ? " (est.)" : ""}` : "n/a"}</td>
                  <td className="px-3 py-3 text-foreground/85">{row(c, "context", "Tools")}</td>
                  <td className="px-3 py-3 text-foreground/85">{row(c, "maintenance", "Last push")}</td>
                  <td className="px-3 py-3 text-foreground/85">{row(c, "maintenance", "Open issues")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {withAlt.length > 0 && (
        <section aria-labelledby="instead" className="section space-y-6">
          <h2 id="instead" className="display-2 fs-title">When the project points elsewhere</h2>
          <p className="prose-measure text-foreground/85">
            Some projects say in their own README that another option fits a use better. We list those, with the source.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {withAlt.map(({ c, a }) => (
              <li key={c.slug} className="surface space-y-2 p-5">
                <p className="eyebrow">Instead of {a!.name}</p>
                <p className="font-medium tracking-[-0.02em]">
                  <a href={c.alternative!.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
                    {c.alternative!.name}
                  </a>
                </p>
                <p className="text-sm leading-[1.6] text-muted-foreground">{c.alternative!.note}</p>
                <Link href={`/agents/${c.slug}`} className="text-sm underline underline-offset-4 hover:text-foreground">See the {a!.name} card</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {withHardening.length > 0 && (
        <section aria-labelledby="limit" className="section space-y-6">
          <h2 id="limit" className="display-2 fs-title">Setups that limit what a server can do</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {withHardening.map(({ c, a }) => (
              <li key={c.slug}>
                <Link href={`/agents/${c.slug}#verified`} className="surface surface-hover block h-full space-y-2 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="eyebrow">{a!.name}</span>
                  <span className="block font-medium tracking-[-0.02em]">{c.hardening[0].title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="section text-sm text-muted-foreground">
        Found a mistake or have a primary source for something we list as not verified? Write to{" "}
        <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">{CORRECTIONS_EMAIL}</a>.
      </p>
    </div>
  );
}
