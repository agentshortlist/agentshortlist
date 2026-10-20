import { getPosts } from "@/lib/blog";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const posts = getPosts();
  const updated = posts[0]?.updated ?? "2026-10-19";
  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n` +
    `  <title>${esc(SITE_NAME)} blog</title>\n  <subtitle>Articles built on verified MCP server cards and published advisories.</subtitle>\n` +
    `  <id>${esc(absoluteUrl("/blog/feed.xml"))}</id>\n` +
    `  <link rel="self" type="application/atom+xml" href="${esc(absoluteUrl("/blog/feed.xml"))}"/>\n` +
    `  <link rel="alternate" type="text/html" href="${esc(absoluteUrl("/blog"))}"/>\n` +
    `  <updated>${esc(updated)}T00:00:00Z</updated>\n  <author><name>${esc(SITE_NAME)}</name></author>\n` +
    posts
      .map(
        (p) =>
          `  <entry>\n    <title>${esc(p.title)}</title>\n    <id>${esc(absoluteUrl(`/blog/${p.slug}`))}</id>\n` +
          `    <link rel="alternate" type="text/html" href="${esc(absoluteUrl(`/blog/${p.slug}`))}"/>\n` +
          `    <published>${p.date}T00:00:00Z</published>\n    <updated>${p.updated}T00:00:00Z</updated>\n    <author><name>${esc(p.author)}</name></author>\n    <summary>${esc(p.description)}</summary>\n  </entry>\n`,
      )
      .join("");
  return new Response(xml + `</feed>\n`, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
