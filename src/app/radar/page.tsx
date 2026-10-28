import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { getPosts } from "@/lib/blog";
import { fmtDate } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "The MCP Risk Radar: checkable MCP evidence by email",
  description: "A short note about MCP servers built from evidence you can check: published advisories, downloads, what we recorded when we started a server and what changed since the last one.",
  alternates: { canonical: "/radar" },
};

const EDITION = /^MCP Risk Radar #\d+/i;

export default function RadarPage() {
  const editions = getPosts().filter((p) => EDITION.test(p.title));
  return (
    <div>
      <JsonLd data={breadcrumbLd([{ name: "Home", url: absoluteUrl("/") }, { name: "MCP Risk Radar", url: absoluteUrl("/radar") }])} />
      <header className="space-y-6">
        <Eyebrow>Newsletter</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">The MCP Risk Radar.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          A short note about MCP servers, built from evidence you can check. Every line has a source, or says &ldquo;not verified&rdquo;.
        </p>
      </header>

      <section className="section grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-5">
          <h2 className="display-2 text-xl sm:text-2xl">What an edition contains</h2>
          <ul className="prose-measure max-w-[42rem] list-disc space-y-2 pl-5 text-[15px] leading-[1.6] text-foreground/85">
            <li>New security advisories for the servers we track, from <a className="underline underline-offset-4 hover:text-foreground" href="https://osv.dev" rel="noopener">OSV.dev</a>, and whether they affect the latest version.</li>
            <li>What changed since the last edition: new releases, projects that go quiet, package downloads.</li>
            <li>What we recorded when we started a server ourselves, with the exact version and the environment. A pass means it started and listed its tools; it does not mean it is safe.</li>
            <li>Corrections. If something we published was wrong, we say so and fix the card.</li>
          </ul>
          <p className="prose-measure max-w-[42rem] text-[15px] leading-[1.6] text-muted-foreground">
            No sponsored picks, and no score that depends on opinion. You can read how we work on the <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology page</Link>.
          </p>
        </div>
        <div className="surface self-start p-5 sm:p-6">
          <NewsletterForm source="radar" alertsOption />
        </div>
      </section>

      <section className="section space-y-6">
        <h2 className="display-2 text-xl sm:text-2xl">Past editions</h2>
        {editions.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">The first edition is on its way. Meanwhile, read the <Link href="/blog" className="underline underline-offset-4">blog</Link>.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {editions.map((p) => (
              <li key={p.slug} className="py-5 first:pt-0">
                <p className="mono-num text-xs text-muted-foreground"><time dateTime={p.date}>{fmtDate(p.date)}</time></p>
                <h3 className="text-xl font-medium tracking-[-0.03em]">
                  <Link href={`/blog/${p.slug}`} className="underline-offset-4 hover:underline">{p.title}</Link>
                </h3>
                <p className="prose-measure max-w-[42rem] text-[15px] leading-[1.6] text-muted-foreground">{p.description}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-muted-foreground">
          Prefer a feed? Subscribe to the <Link href="/blog/feed.xml" className="underline underline-offset-4 hover:text-foreground">Atom feed</Link> of the blog. Editions are published there too.
        </p>
      </section>
    </div>
  );
}
