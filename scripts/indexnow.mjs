// Avisa a Bing y otros buscadores con IndexNow de las URLs del sitemap. Solo se lanza a mano, con orden expresa.
// Uso: node scripts/indexnow.mjs [--dry] [url ...]   (sin URLs, usa todas las del sitemap)
const HOST = "agentshortlist.dev";
const KEY = "4b2ea51ffb81ee3fb69a4908c844f23f";
const dry = process.argv.includes("--dry");
let urls = process.argv.slice(2).filter((a) => a.startsWith("http"));
if (!urls.length) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
console.log(`${urls.length} URLs`);
if (dry) process.exit(0);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(res.status, res.statusText);
