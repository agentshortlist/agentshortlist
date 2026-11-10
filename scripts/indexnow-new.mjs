// Avisa con IndexNow (Bing y otros buscadores; no Google) SOLO de las URLs nuevas del sitemap, y solo de las que ya responden 200.
// Lo lanza scripts/sync-plesk.sh al final de una publicación correcta. Autorizado por el propietario el 10 nov 2026 para URLs nuevas.
// Uso: node scripts/indexnow-new.mjs <archivo-de-vistas> [--dry]
//  - Sin archivo previo: primera ejecución. Anota como vistas las URLs que ya responden 200 y NO envía nada (no se avisa de todo el sitio).
//  - Con archivo: envía las URLs del sitemap que no están en él y responden 200 (máx. 100 por ejecución) y las anota como vistas.
//  - Una URL que aún no responde 200 se deja sin anotar y se reintenta en la siguiente publicación.
//  - Nunca falla la sincronización: ante cualquier error sale con código 0 y lo cuenta en el registro.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const HOST = "agentshortlist.dev";
const KEY = "4b2ea51ffb81ee3fb69a4908c844f23f";
const MAX = 100;
const dry = process.argv.includes("--dry");
const seenFile = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!seenFile) { console.log("IndexNow: falta el archivo de URLs vistas"); process.exit(0); }

const get = async (url) => {
  try { const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000) }); return r.status; } catch { return 0; }
};

async function okOnly(urls) {
  const good = [];
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (i < urls.length) { const u = urls[i++]; if ((await get(u)) === 200) good.push(u); }
  }));
  return good;
}

try {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`, { signal: AbortSignal.timeout(30000) })).text();
  const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!all.length) { console.log("IndexNow: sitemap vacío, no hago nada"); process.exit(0); }

  if (!existsSync(seenFile)) {
    const good = await okOnly(all);
    if (!dry) writeFileSync(seenFile, good.join("\n") + "\n");
    console.log(`IndexNow: primera ejecución, ${good.length} de ${all.length} URLs anotadas como vistas; no se envía nada`);
    process.exit(0);
  }

  const seen = new Set(readFileSync(seenFile, "utf8").split("\n").filter(Boolean));
  const candidates = all.filter((u) => !seen.has(u));
  if (!candidates.length) { console.log("IndexNow: sin URLs nuevas"); process.exit(0); }
  const fresh = (await okOnly(candidates)).slice(0, MAX);
  const waiting = candidates.length - fresh.length;
  if (!fresh.length) { console.log(`IndexNow: ${candidates.length} URLs nuevas en el sitemap pero ninguna responde 200 todavía; se reintentará`); process.exit(0); }
  console.log(`IndexNow: ${fresh.length} URLs nuevas${waiting > 0 ? ` (${waiting} aún sin 200 o fuera del tope)` : ""}:`);
  for (const u of fresh) console.log("  " + u);
  if (dry) { console.log("IndexNow: --dry, no se envía"); process.exit(0); }

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: fresh }),
    signal: AbortSignal.timeout(30000),
  });
  console.log(`IndexNow: respuesta ${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) writeFileSync(seenFile, [...seen, ...fresh].join("\n") + "\n");
  else console.log("IndexNow: no se anotan como vistas; se reintentará");
} catch (e) {
  console.log("IndexNow: error, no afecta a la publicación:", e instanceof Error ? e.message : e);
}
process.exit(0);
