import { groupXml, sitemapGroups } from "@/lib/sitemap-groups";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return sitemapGroups().map((g) => ({ group: `${g.id}.xml` }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ group: string }> }) {
  const { group } = await ctx.params;
  const g = sitemapGroups().find((x) => `${x.id}.xml` === group);
  if (!g) return new Response("Not found", { status: 404 });
  return new Response(groupXml(g), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
