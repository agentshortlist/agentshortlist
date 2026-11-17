import { indexXml, sitemapGroups } from "@/lib/sitemap-groups";

export const dynamic = "force-static";

export function GET() {
  return new Response(indexXml(sitemapGroups()), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
