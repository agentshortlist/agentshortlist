import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { getPosts } from "@/lib/blog";
import { fmtDate } from "@/lib/data";

export function generateMetadata(): Metadata {
  return {
    title: "Blog: MCP servers read from their docs",
    description: "Articles built on the verified cards: what MCP servers can change, what they send out and how to run them more safely. Every claim has a source.",
    alternates: { canonical: "/blog", types: { "application/atom+xml": "/blog/feed.xml" } },
    ...(getPosts().length ? {} : { robots: { index: false } }),
  };
}

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Blog</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">What we learn from reading MCP servers.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Short, sourced articles built on the verified cards and the published advisories. No claim without a link to where it comes from.{" "}
          <Link href="/blog/feed.xml" className="underline underline-offset-4 hover:text-foreground">Atom feed</Link>.
        </p>
      </header>
      <section className="section">
        {posts.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">The first articles are on their way. Meanwhile, see the <Link href="/verified" className="underline underline-offset-4">verified cards</Link>.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {posts.map((p) => (
              <li key={p.slug} className="py-7 first:pt-0">
                <article className="space-y-2">
                  <p className="mono-num text-xs text-muted-foreground">
                    {p.author} · <time dateTime={p.date}>{fmtDate(p.date)}</time>
                    {p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
                  </p>
                  <h2 className="text-2xl font-medium tracking-[-0.035em]">
                    <Link href={`/blog/${p.slug}`} className="underline-offset-4 hover:underline">{p.title}</Link>
                  </h2>
                  <p className="prose-measure max-w-[42rem] text-[15px] leading-[1.6] text-muted-foreground">{p.description}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
