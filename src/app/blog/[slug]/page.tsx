import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { ShareButtons } from "@/components/share-buttons";
import { getPost, getPosts } from "@/lib/blog";
import { fmtDate } from "@/lib/data";
import { AUTHOR_BIO, AUTHOR_NAME, SITE_NAME, absoluteUrl, fitTitle } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => getPosts().map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: fitTitle([p.title, p.title.slice(0, 48)]),
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, url: absoluteUrl(`/blog/${p.slug}`), publishedTime: p.date, modifiedTime: p.updated },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-[44rem]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.updated,
          mainEntityOfPage: absoluteUrl(`/blog/${p.slug}`),
          author: { "@type": "Person", name: p.author, ...(p.author === AUTHOR_NAME ? { url: absoluteUrl("/about"), description: AUTHOR_BIO } : {}) },
          publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/apple-icon") } },
          image: absoluteUrl(`/blog/${p.slug}/opengraph-image`),
        }}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: absoluteUrl("/") },
          { name: "Blog", url: absoluteUrl("/blog") },
          { name: p.title, url: absoluteUrl(`/blog/${p.slug}`) },
        ])}
      />
      <nav aria-label="Breadcrumb" className="eyebrow">
        <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
        <span aria-hidden="true" className="px-2 text-ink/25">/</span>
        <Link href="/blog" className="transition-colors hover:text-foreground">Blog</Link>
      </nav>
      <header className="space-y-5 pt-6">
        <h1 className="display-2 reveal fs-title">{p.title}</h1>
        <p className="mono-num text-xs text-muted-foreground">
          By {p.author === AUTHOR_NAME ? <Link href="/about" className="underline underline-offset-4 hover:text-foreground">{p.author}</Link> : p.author} · Published <time dateTime={p.date}>{fmtDate(p.date)}</time>
          {p.updated !== p.date ? <> · Last updated <time dateTime={p.updated}>{fmtDate(p.updated)}</time></> : null}
          {p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
        </p>
        <p className="text-[17px] leading-[1.6] text-foreground/80">{p.description}</p>
        <ShareButtons url={absoluteUrl(`/blog/${p.slug}`)} title={p.title} label="Share this article, top" />
      </header>
      <div className="section">
        <Markdown source={p.body} />
      </div>
      <div className="mt-10 border-t border-ink/10 pt-6">
        <ShareButtons url={absoluteUrl(`/blog/${p.slug}`)} title={p.title} />
      </div>
      {p.author === AUTHOR_NAME && (
        <aside className="mt-8 space-y-2 border-t border-ink/10 pt-6">
          <p className="text-[15px] leading-[1.6] text-foreground/85">{AUTHOR_BIO}</p>
          <p className="text-sm text-muted-foreground">
            <Link href="/about" className="underline underline-offset-4 hover:text-foreground">About the author and the project</Link>
          </p>
        </aside>
      )}
      <aside className="surface mt-8 space-y-3 p-6">
        <p className="eyebrow">Keep going</p>
        <p className="text-[15px] leading-[1.6] text-foreground/85">
          Check your own setup with the <Link href="/check" className="underline underline-offset-4 hover:text-foreground">config checker</Link> (it runs in
          your browser), browse the <Link href="/verified" className="underline underline-offset-4 hover:text-foreground">verified cards</Link>, or get new
          articles and ranking changes by email from the form at the bottom of the page.
        </p>
      </aside>
    </article>
  );
}
