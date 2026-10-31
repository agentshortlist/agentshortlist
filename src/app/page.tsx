import Link from "next/link";
import { AgentTable } from "@/components/agent-table";
import { HeroDots } from "@/components/hero-dots";
import { SponsoredSlot } from "@/components/sponsored-slot";
import { JsonLd } from "@/components/json-ld";
import { SignalMap } from "@/components/signal-map";
import { FaqList } from "@/components/faq-list";
import { Eyebrow, PillLink } from "@/components/ui-kit";
import { VERIFIED } from "@/content/verified";
import { ADVISORIES_TOTAL, CHECKED_PACKAGES, getAdvisories } from "@/lib/advisories";
import { getPosts } from "@/lib/blog";
import {
  BEST_PAGES,
  CATEGORIES,
  RECENCY_WINDOW_DAYS,
  WEIGHTS,
  agentsForPage,
  fmtDate,
  getAgents,
  getAgentsByCategory,
  rank,
} from "@/lib/data";

// Sin revalidación en caliente: los artículos se leen del disco (src/content/blog) y en el servidor de producción esa carpeta no existe,
// así que al regenerar la página en caliente el bloque del blog salía vacío. La página se genera en cada build (y el sync diario reconstruye).

export const metadata = {
  alternates: { canonical: "/" },
};

const section = "section space-y-10 ";

export default function HomePage() {
  const all = getAgents();
  const total = all.length;
  const top = rank(all).slice(0, 8);
  const verified = all.map((a) => a.verifiedAt).sort().at(-1)!;
  const cards = VERIFIED.length;
  // Ejemplo real del comprobador: el primer aviso de Playwright MCP y su versión corregida.
  const posts = getPosts().slice(0, 3);
  const demo = getAdvisories("playwright-mcp")[0]?.vulns.find((v) => v.fixedIn.length > 0);

  const faq = [
    {
      q: "What is AgentShortlist?",
      a: `A strictly curated directory of AI agents, coding agents and MCP servers. ${total} tools are listed, grouped into ${BEST_PAGES.length} use-case rankings, each scored on public GitHub signals.`,
    },
    {
      q: "How are the rankings calculated?",
      a: `Each tool scores up to 100: ${WEIGHTS.stars} points for GitHub stars, ${WEIGHTS.recency} for how recently the repository was pushed, and ${WEIGHTS.license} for an open-source license. The formula is the same for every ranking and is published on the methodology page.`,
    },
    {
      q: "Why are some well-known tools missing?",
      a: `A tool is listed only if its repository is not archived and was pushed within the last ${RECENCY_WINDOW_DAYS} days. Tools that fail that rule are removed, however popular they are.`,
    },
    {
      q: "Does sponsorship change the order?",
      a: "No. Paid placements are not live yet. When they launch they will be labeled and shown separately, and they will never change a tool's score or position.",
    },
    {
      q: "How fresh are the numbers?",
      a: `Stars, last push and license come from the public GitHub API and are refreshed whenever the site is rebuilt. Every ranking shows its verification date; the latest is ${fmtDate(verified)}.`,
    },
  ];

  return (
    <div>
      {posts.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Latest articles on MCP servers",
            itemListElement: posts.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://agentshortlist.dev/blog/${p.slug}`,
              name: p.title,
            })),
          }}
        />
      )}
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

      {/* Hero a todo el ancho de la ventana y al menos todo el alto de pantalla. Medidas de la referencia a 1800 px:
          etiqueta, titular a 32 px, subtítulo a 28 px, párrafo a 14 px, píldora a 48 px, botones a 16 px. */}
      <section className="relative isolate -mt-28 left-1/2 flex min-h-svh w-screen -translate-x-1/2 flex-col items-center justify-center px-4 pb-24 pt-32 text-center sm:-mt-[152px] sm:px-6 sm:pb-32 sm:pt-[10.5rem]">
        <HeroDots />
        <p className="hero-tag reveal" tabIndex={0}>
          <i aria-hidden="true" className="hero-tag-dot" />
          <span className="hero-tag-label" data-text="Ranked by real signals">Ranked by real signals</span>
        </p>
        <h1 className="display fs-hero reveal reveal-1 mt-8 max-w-[1100px]">Find the right AI agent for the job.</h1>
        <p className="reveal reveal-2 mt-7 max-w-[46rem] text-xl leading-7 text-foreground/75">
          A strictly curated directory of AI agents, coding agents and MCP servers.
        </p>
        <p className="reveal reveal-2 mt-3.5 max-w-[40rem] text-[15px] leading-[1.5] text-muted-foreground">
          Ranked on public GitHub data, plus verified cards, security advisories and a config checker for MCP servers.
        </p>
        <p className="reveal reveal-3 mono-num mt-12 inline-flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-ink/[0.05] px-5 text-xs text-foreground/80">
          <span>{total} tools</span>
          <span aria-hidden="true" className="text-ink/25">/</span>
          <span>{cards} verified cards</span>
          <span aria-hidden="true" className="text-ink/25">/</span>
          <span>{BEST_PAGES.length} rankings</span>
          <span aria-hidden="true" className="text-ink/25">/</span>
          <span>checked {fmtDate(verified)}</span>
        </p>
        <div className="reveal reveal-4 mt-4 flex flex-wrap items-center justify-center gap-3">
          <PillLink href="/check">Check your MCP setup</PillLink>
          <PillLink href="/compare/live" variant="soft">Compare servers</PillLink>
          <PillLink href="/best/coding" variant="ghost">Browse rankings</PillLink>
        </div>
      </section>

      <section aria-labelledby="tools" className={section}>
        <div className="space-y-4">
          <Eyebrow>Before you install an MCP server</Eyebrow>
          <h2 id="tools" className="display-2 max-w-4xl fs-title">Know what it can do before it runs on your machine.</h2>
          <p className="prose-measure text-muted-foreground">
            {cards} servers read from their own docs and source, with the origin of every line. {ADVISORIES_TOTAL} security advisories
            matched to {CHECKED_PACKAGES} packages. No stars involved.
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          <Link
            href="/check"
            className="surface surface-hover group flex flex-col justify-between gap-8 p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring lg:col-span-3 lg:p-8"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow">Config checker</p>
                <span aria-hidden="true" className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
              </div>
              <h3 className="text-2xl font-medium tracking-[-0.035em]">Paste your MCP config. See what is missing.</h3>
              <p className="max-w-[34rem] text-sm leading-[1.6] text-muted-foreground">
                Flags documented safety options you have not turned on, and checks a pinned version against published advisories. It runs in your
                browser and sends nothing.
              </p>
            </div>
            <div className="mono-num space-y-2 rounded-xl bg-ink/[0.06] p-4 text-[13px] leading-[1.6]">
              <p className="text-muted-foreground">&quot;args&quot;: [&quot;@playwright/mcp@0.0.35&quot;]</p>
              <p>
                Pinned to 0.0.35: in the affected range of {demo ? demo.id : "a published advisory"}
                {demo ? ` (fixed in ${demo.fixedIn[0]})` : ""}.
              </p>
            </div>
          </Link>
          <div className="grid gap-3 lg:col-span-2">
            {[
              { href: "/compare/live", k: "Compare", t: "Two or three servers, line by line", d: "Permissions, telemetry, upkeep and advisories side by side." },
              { href: "/pick", k: "Pick", t: "Start from what you need", d: "Filter by job and by what it must meet. Unknown never counts as a yes." },
              { href: "/verified", k: "Verified cards", t: `${cards} servers, sources on every line`, d: "What each one can change, send out and how to limit it." },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="surface surface-hover group flex items-start justify-between gap-4 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="space-y-1.5">
                  <p className="eyebrow">{x.k}</p>
                  <h3 className="font-medium tracking-[-0.035em]">{x.t}</h3>
                  <p className="text-sm text-muted-foreground">{x.d}</p>
                </div>
                <span aria-hidden="true" className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="blog" className={section}>
          <div className="space-y-4">
            <Eyebrow>From the blog</Eyebrow>
            <h2 id="blog" className="display-2 max-w-4xl fs-title">Latest articles on MCP servers: tests, advisories, evidence.</h2>
            <p className="prose-measure text-muted-foreground">
              What happens when we start the servers ourselves, what the published advisories say, and where a tool list can mislead. Every claim
              links to its source.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-5">
            <article className="surface surface-hover group relative flex flex-col justify-between gap-8 p-6 lg:col-span-3 lg:p-8">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="mono-num text-xs text-muted-foreground">
                    <time dateTime={posts[0].date}>{fmtDate(posts[0].date)}</time>
                    {posts[0].tags.length ? ` · ${posts[0].tags.join(", ")}` : ""}
                  </p>
                  <span aria-hidden="true" className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
                </div>
                <h3 className="text-2xl font-medium tracking-[-0.035em]">
                  <Link href={`/blog/${posts[0].slug}`} className="outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring">
                    {posts[0].title}
                  </Link>
                </h3>
                <p className="max-w-[34rem] text-sm leading-[1.6] text-muted-foreground">{posts[0].description}</p>
              </div>
            </article>
            <div className="grid gap-3 lg:col-span-2">
              {posts.slice(1).map((p) => (
                <article key={p.slug} className="surface surface-hover group relative flex items-start justify-between gap-4 p-5">
                  <div className="space-y-1.5">
                    <p className="mono-num text-xs text-muted-foreground">
                      <time dateTime={p.date}>{fmtDate(p.date)}</time>
                    </p>
                    <h3 className="font-medium tracking-[-0.035em]">
                      <Link href={`/blog/${p.slug}`} className="outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring">
                        {p.title}
                      </Link>
                    </h3>
                    <p className="line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <span aria-hidden="true" className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">→</span>
                </article>
              ))}
            </div>
          </div>
          <div>
            <PillLink href="/blog" variant="soft">All articles</PillLink>
          </div>
        </section>
      )}

      <section aria-labelledby="rankings" className={section}>
        <div className="space-y-4">
          <Eyebrow>The rankings</Eyebrow>
          <h2 id="rankings" className="display-2 fs-title">Best AI agents by use case.</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {BEST_PAGES.map((b, i) => (
            <Link
              key={b.slug}
              href={`/best/${b.slug}`}
              className="surface surface-hover group flex flex-col justify-between gap-8 p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="mono-num text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden="true" className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground">
                  →
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-medium tracking-[-0.035em]">{b.h1}</h3>
                <p className="text-sm text-muted-foreground">
                  {agentsForPage(b).length} tools · for {b.audience}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Sponsored" className="mt-16">
        <SponsoredSlot />
      </section>

      <section aria-labelledby="signals" className={section}>
        <div className="space-y-4">
          <Eyebrow>The signals</Eyebrow>
          <h2 id="signals" className="display-2 max-w-4xl fs-title">Three signals. One public formula.</h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            { n: "01", pts: WEIGHTS.stars, t: "Popularity", d: "GitHub stars, log-scaled against the strongest tool in the same list, so one giant project does not flatten the rest." },
            { n: "02", pts: WEIGHTS.recency, t: "Activity", d: `Full marks for a push today, zero at ${RECENCY_WINDOW_DAYS} days. Archived repositories never qualify.` },
            { n: "03", pts: WEIGHTS.license, t: "Openness", d: "An open-source license detected by GitHub. Projects without one can still be listed, but score lower here." },
          ].map((s) => (
            <div key={s.n} className="space-y-4">
              <p className="mono-num text-xs text-muted-foreground">{s.n}</p>
              <p className="display text-6xl">{s.pts}<span className="text-2xl text-muted-foreground"> pts</span></p>
              <h3 className="text-lg font-medium tracking-[-0.035em]">{s.t}</h3>
              <p className="prose-measure text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p>
          <Link href="/methodology" className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline">
            Read the full methodology →
          </Link>
        </p>
      </section>

      <section aria-labelledby="map" className={section}>
        <div className="space-y-4">
          <Eyebrow>The map</Eyebrow>
          <h2 id="map" className="display-2 max-w-4xl fs-title">
            {total} tools, plotted by popularity and activity.
          </h2>
          <p className="prose-measure text-muted-foreground">
            Right means more stars, lower means a longer time since the last push. Filter by category, find a tool by name, or select a dot to see its numbers.
          </p>
        </div>
        <SignalMap agents={all} />
      </section>

      <section aria-labelledby="leaderboard" className={section}>
        <div className="space-y-4">
          <Eyebrow>The leaderboard</Eyebrow>
          <h2 id="leaderboard" className="display-2 fs-title">Top-scoring tools right now.</h2>
          <p className="prose-measure text-muted-foreground">
            Scores here are relative to the full list. Inside each ranking they are relative to that ranking.
          </p>
        </div>
        <AgentTable agents={top} showScore />
      </section>

      <section aria-labelledby="cats" className={section}>
        <div className="space-y-4">
          <Eyebrow>Browse</Eyebrow>
          <h2 id="cats" className="display-2 fs-title">By category.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className="surface surface-hover flex min-h-36 flex-col justify-between gap-6 p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="mono-num text-xs text-muted-foreground">{getAgentsByCategory(c.slug).length} tools</p>
              <div className="space-y-1">
                <h3 className="font-medium tracking-[-0.035em]">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq" className={section}>
        <div className="space-y-4">
          <Eyebrow>Questions</Eyebrow>
          <h2 id="faq" className="display-2 fs-title">Common questions.</h2>
        </div>
        <FaqList items={faq} />
      </section>

    </div>
  );
}
