// Devuelve las URLs de /sitemap.xml, sea un urlset o un índice de sitemaps (en ese caso, sigue cada archivo).
// Uso: const { urls, status, files } = await sitemapUrls("https://agentshortlist.dev");
export async function sitemapUrls(origin) {
  const res = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(30000) });
  const text = res.status < 300 ? await res.text() : "";
  const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!/<sitemapindex/.test(text)) return { urls: locs(text), status: res.status, files: ["/sitemap.xml"] };
  const files = locs(text).map((u) => u.replace(/^https?:\/\/[^/]+/, origin));
  const urls = [];
  for (const f of files) {
    const r = await fetch(f, { signal: AbortSignal.timeout(30000) });
    if (r.status >= 300) throw new Error(`sitemap hijo ${f}: ${r.status}`);
    urls.push(...locs(await r.text()));
  }
  return { urls, status: res.status, files };
}
