// Auditoría SEO de todas las URLs del sitemap: estado, title, description, canonical, robots, h1, Open Graph y JSON-LD.
// Uso: node scripts/seo-audit.mjs https://agentshortlist.dev
const base = (process.argv[2] ?? "https://agentshortlist.dev").replace(/\/$/, "");
const get = async (u) => {
  const r = await fetch(u, { redirect: "manual", headers: { "User-Agent": "agentshortlist-seo-audit" } });
  return { status: r.status, headers: r.headers, text: r.status < 300 ? await r.text() : "" };
};
const pick = (re, s) => (s.match(re) ?? [])[1] ?? null;
const dec = (s) => (s ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const sm = await get(`${base}/sitemap.xml`);
const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, base));
console.log(`sitemap: ${urls.length} URLs (status ${sm.status})`);

const rows = [];
const queue = [...urls];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const u = queue.shift();
      const { status, text, headers } = await get(u);
      const title = dec(pick(/<title[^>]*>([^<]*)<\/title>/, text));
      const desc = dec(pick(/<meta name="description" content="([^"]*)"/, text));
      const canonical = pick(/<link rel="canonical" href="([^"]*)"/, text);
      const robots = pick(/<meta name="robots" content="([^"]*)"/, text);
      const h1 = [...text.matchAll(/<h1[\s>]/g)].length;
      const ogTitle = !!pick(/<meta property="og:title" content="([^"]*)"/, text);
      const ogImage = pick(/<meta property="og:image" content="([^"]*)"/, text);
      const twitter = !!pick(/<meta name="twitter:card" content="([^"]*)"/, text);
      const ld = [...text.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
        try {
          const j = JSON.parse(m[1]);
          return [].concat(j["@graph"] ?? j).map((x) => x["@type"]).join("+");
        } catch {
          return "INVALID_JSON";
        }
      });
      rows.push({ u, status, title, desc, canonical, robots, h1, ogTitle, ogImage, twitter, ld, xrobots: headers.get("x-robots-tag") });
    }
  }),
);
rows.sort((a, b) => a.u.localeCompare(b.u));

const issues = [];
const add = (u, m) => issues.push(`${u.replace(base, "") || "/"}  ${m}`);
const seenT = new Map(), seenD = new Map();
for (const r of rows) {
  if (r.status !== 200) add(r.u, `status ${r.status}`);
  if (!r.title) add(r.u, "sin title");
  else {
    if (r.title.length > 65) add(r.u, `title largo (${r.title.length}): ${r.title}`);
    if (r.title.length < 15) add(r.u, `title corto (${r.title.length}): ${r.title}`);
    seenT.set(r.title, [...(seenT.get(r.title) ?? []), r.u]);
  }
  if (!r.desc) add(r.u, "sin meta description");
  else {
    if (r.desc.length > 160) add(r.u, `description larga (${r.desc.length})`);
    if (r.desc.length < 70) add(r.u, `description corta (${r.desc.length}): ${r.desc}`);
    seenD.set(r.desc, [...(seenD.get(r.desc) ?? []), r.u]);
  }
  const self = r.u.replace(/\/$/, "").replace(/^https?:\/\/[^/]+/, "");
  if (!r.canonical) add(r.u, "sin canonical");
  else if (r.canonical.replace(/\/$/, "").replace(/^https?:\/\/[^/]+/, "") !== self) add(r.u, `canonical distinto: ${r.canonical}`);
  if (r.robots && /noindex|nofollow/i.test(r.robots)) add(r.u, `robots: ${r.robots}`);
  if (r.xrobots) add(r.u, `X-Robots-Tag: ${r.xrobots}`);
  if (r.h1 !== 1) add(r.u, `h1: ${r.h1}`);
  if (!r.ogTitle) add(r.u, "sin og:title");
  if (!r.ogImage) add(r.u, "sin og:image");
  if (!r.twitter) add(r.u, "sin twitter:card");
  if (!r.ld.length) add(r.u, "sin JSON-LD");
  if (r.ld.includes("INVALID_JSON")) add(r.u, "JSON-LD inválido");
}
for (const [t, us] of seenT) if (us.length > 1) add(us[0], `title duplicado en ${us.length} URLs: ${t}`);
for (const [, us] of seenD) if (us.length > 1) add(us[0], `description duplicada en ${us.length} URLs`);

// Resumen por tipo de página
const group = (u) => u.replace(base, "").replace(/\/[^/]+$/, "/*") || "/";
const byType = {};
for (const r of rows) {
  const g = r.u === base || r.u === `${base}/` ? "/" : group(r.u);
  byType[g] ??= { n: 0, ex: r };
  byType[g].n++;
}
console.log("\n== Tipos de página");
for (const [g, v] of Object.entries(byType))
  console.log(`${g.padEnd(24)} ${String(v.n).padStart(3)}  JSON-LD: ${v.ex.ld.join(" | ")}\n   title: ${v.ex.title}\n   desc : ${v.ex.desc}`);
console.log(`\n== Incidencias (${issues.length})`);
console.log(issues.join("\n") || "ninguna");
