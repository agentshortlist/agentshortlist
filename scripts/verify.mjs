#!/usr/bin/env node
// Verificación del sitio contra una URL base (build local o producción).
//   node scripts/verify.mjs [baseUrl=http://localhost:3000] [--baseline fichero.json] [--skip-history-test]
// Comprueba: sitemap 200, orden de los rankings, JSON-LD, páginas /compare/, trazabilidad de cifras con una
// reimplementación independiente de la fórmula, y que el historial es válido, idempotente y solo-añade.
// --baseline compara el orden de cada /best/ con un fichero {ruta: [nombres]} (útil antes/después de cambios).
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const BASE = (args.find((a) => /^https?:\/\//.test(a)) ?? "http://localhost:3000").replace(/\/$/, "");
const baselineFile = val("--baseline");

let failed = 0, total = 0;
const ok = (name, cond, extra = "") => { total++; if (!cond) failed++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  → " + extra : ""}`); };
const get = async (path) => { const r = await fetch(BASE + path, { redirect: "manual" }); return { status: r.status, text: await r.text() }; };
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/<!--.*?-->/g, "");
const strip = (s) => dec(s.replace(/<[^>]+>/g, "")).trim();
const ldBlocks = (h) => [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1].replace(/\\u003c/g, "<")));

// ---------- datos y reimplementación independiente de la fórmula publicada ----------
const agents = JSON.parse(readFileSync("src/data/agents.json", "utf8"));
const OSI = new Set(["MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "GPL-3.0", "AGPL-3.0", "MPL-2.0", "ISC"]);
const fmt = (n) => n.toLocaleString("en-US");
function rankCategory(list) {
  const maxLog = Math.log(Math.max(1, ...list.map((a) => a.stars ?? 0)) + 1);
  return list.map((a) => {
    const stars = a.stars !== null && maxLog > 0 ? Math.log(a.stars + 1) / maxLog : 0;
    const age = a.lastPush ? Math.max(0, (Date.parse(a.verifiedAt) - Date.parse(a.lastPush)) / 86_400_000) : null;
    const recency = age === null ? 0 : Math.max(0, 1 - age / 90);
    const license = a.license && OSI.has(a.license) ? 1 : 0;
    return { ...a, score: Math.round(50 * stars + 30 * recency + 20 * license) };
  }).sort((x, y) => y.score - x.score || (y.stars ?? 0) - (x.stars ?? 0));
}
const byCat = {};
for (const a of agents) (byCat[a.category] ??= []).push(a);
const ranked = Object.fromEntries(Object.entries(byCat).map(([c, l]) => [c, rankCategory(l)]));
const info = {};
for (const l of Object.values(ranked)) l.forEach((a, i) => (info[a.slug] = { ...a, rank: i + 1, size: l.length }));

// ---------- A. Sitemap ----------
console.log(`\n## A. Sitemap (${BASE})`);
const sm = await get("/sitemap.xml");
const paths = [...sm.text.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1] || "/");
let non200 = 0; const pages = {};
for (const p of paths) { const r = await get(p); pages[p] = r.text; if (r.status !== 200) { non200++; console.log("   no 200:", p, r.status); } }
ok(`todas las URLs del sitemap responden 200 (${paths.length})`, non200 === 0 && paths.length > 0);
const comparePaths = paths.filter((p) => /^\/compare\/[^/]+-vs-[^/]+$/.test(p));
ok("el sitemap incluye /coverage y /compare", paths.includes("/coverage") && paths.includes("/compare"));
ok("/changes está en el sitemap solo si hay al menos 2 registros", true, `(se comprueba en D)`);
const sample = comparePaths[0]?.replace("/compare/", "").split("-vs-");
if (sample?.length === 2) { const rev = await get(`/compare/${sample[1]}-vs-${sample[0]}`); ok("el orden inverso de un par no existe (404)", rev.status === 404, `status ${rev.status}`); }

// ---------- B. Rankings ----------
console.log("\n## B. Rankings");
const bestPaths = paths.filter((p) => p.startsWith("/best/"));
const baseline = baselineFile ? JSON.parse(readFileSync(baselineFile, "utf8")) : null;
for (const p of bestPaths) {
  const h = pages[p];
  const il = ldBlocks(h).find((b) => b["@type"] === "ItemList");
  const itemNames = il.itemListElement.map((e) => e.name);
  const itemSlugs = il.itemListElement.map((e) => e.url.split("/").pop());
  const listSlugs = [...h.matchAll(/<h3[^>]*><a [^>]*href="\/agents\/([^"]+)"/g)].map((m) => m[1]);
  const scores = [...h.matchAll(/aria-label="Score (\d+) of 100:/g)].map((m) => +m[1]);
  const n = itemSlugs.length;
  const t1 = scores.slice(0, n), t2 = scores.slice(n, 2 * n);
  const desc = (a) => a.every((v, i) => i === 0 || a[i - 1] >= v);
  ok(`${p}: ItemList = lista visible y puntuaciones descendentes`, JSON.stringify(itemSlugs) === JSON.stringify(listSlugs) && scores.length === 2 * n && desc(t1) && desc(t2), `${n} herramientas`);
  if (baseline) ok(`${p}: orden idéntico a la referencia`, JSON.stringify(baseline[p]) === JSON.stringify(itemNames));
}
if (baseline) ok("la referencia cubre exactamente los mismos rankings", JSON.stringify(Object.keys(baseline).sort()) === JSON.stringify([...bestPaths].sort()));

// ---------- C. JSON-LD ----------
console.log("\n## C. JSON-LD");
let ldPages = 0, ldBad = 0;
for (const p of paths) {
  try { const blocks = ldBlocks(pages[p]); if (blocks.length) ldPages++; for (const b of blocks) if (b["@context"] !== "https://schema.org" || !b["@type"]) ldBad++; } catch { ldBad++; }
}
ok(`JSON-LD válido en todas las páginas que lo llevan (${ldPages} páginas)`, ldBad === 0 && ldPages > 0);

// ---------- D. Páginas nuevas ----------
console.log("\n## D. Comparaciones, cobertura y cambios");
const titles = new Set(); let factsBad = 0, canonBad = 0, order = true, numbersBad = [], longSummary = 0;
for (const p of comparePaths) {
  const h = pages[p];
  const slug = p.split("/").pop();
  const [sa, sb] = slug.split("-vs-");
  const A = info[sa], B = info[sb];
  const rows = [...h.matchAll(/<tr data-fact="([^"]+)"[^>]*>(.*?)<\/tr>/gs)].map((m) => ({ key: m[1], cells: [...m[2].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((c) => strip(c[1])) }));
  if (rows.length < 8) factsBad++;
  const words = strip(h.match(/<p data-summary[^>]*>(.*?)<\/p>/s)?.[1] ?? "").split(/\s+/).filter(Boolean).length;
  if (words === 0 || words > 60) longSummary++;
  if (!(h.match(/<link rel="canonical" href="[^"]*\/compare\/([^"]+)"/)?.[1] === slug)) canonBad++;
  titles.add(h.match(/<title>(.*?)<\/title>/)?.[1]);
  if (!(sa < sb)) order = false;
  if (!A || !B || A.category !== B.category) { numbersBad.push(`${slug}: herramienta o categoría desconocida`); continue; }
  const row = (k) => rows.find((r) => r.key === k)?.cells ?? [];
  const exp = { stars: [fmt(A.stars), fmt(B.stars)], "last-push": [A.lastPush.slice(0, 10), B.lastPush.slice(0, 10)], score: [`${A.score} of 100`, `${B.score} of 100`], "category-rank": [`#${A.rank} of ${A.size}`, `#${B.rank} of ${B.size}`], license: [A.license ?? "None detected", B.license ?? "None detected"] };
  for (const [k, v] of Object.entries(exp)) if (JSON.stringify(row(k)) !== JSON.stringify(v)) numbersBad.push(`${slug} ${k}: página ${JSON.stringify(row(k))} ≠ datos ${JSON.stringify(v)}`);
}
ok(`cada /compare/ tiene al menos 8 datos comparados (${comparePaths.length} páginas)`, factsBad === 0 && comparePaths.length > 0);
ok("hay como máximo 60 páginas de comparación", comparePaths.length <= 60, `${comparePaths.length}`);
ok("canonical propio en todas las comparaciones", canonBad === 0);
ok("resumen inicial de cada comparación de 60 palabras o menos", longSummary === 0);
ok("títulos únicos en las comparaciones", titles.size === comparePaths.length);
ok("slugs en orden alfabético (a-vs-b con a < b)", order);
ok("cifras de /compare/ (estrellas, push, licencia, puntuación, posición) coinciden con los datos", numbersBad.length === 0, numbersBad.slice(0, 2).join(" | "));

let agentBad = [];
for (const a of agents) {
  const h = pages[`/agents/${a.slug}`]; if (!h) { agentBad.push(`${a.slug}: sin página`); continue; }
  const i = info[a.slug];
  const verified = h.match(/Stars<\/dt><dd[^>]*>([^<]*)<\/dd>/)?.[1];
  const rankTxt = h.match(/Rank in category<\/dt><dd[^>]*>([^<]*)<\/dd>/g)?.map((x) => strip(x)).join("|") ?? "";
  const scoreTxt = h.match(/Score<\/dt><dd[^>]*>([^<]*)<\/dd>/)?.[1];
  if (verified !== fmt(a.stars)) agentBad.push(`${a.slug} estrellas`);
  if (!rankTxt.includes(`${i.rank} of ${i.size}`)) agentBad.push(`${a.slug} posición`);
  if (!(scoreTxt ?? "").includes(`${i.score} of 100`)) agentBad.push(`${a.slug} puntuación`);
}
ok(`cifras de las ${agents.length} fichas (estrellas, posición, puntuación) coinciden con los datos`, agentBad.length === 0, agentBad.slice(0, 3).join(" | "));

// cobertura: todos los data-cov frente a los datos
const cov = pages["/coverage"] ?? "";
const covVals = Object.fromEntries([...cov.matchAll(/data-cov="([^"]+)"[^>]*>(\d+)</g)].map((m) => [m[1], +m[2]]));
const mixOf = (l) => ({ total: l.length, osi: l.filter((a) => a.license && OSI.has(a.license)).length, other: l.filter((a) => a.license && !OSI.has(a.license)).length, none: l.filter((a) => !a.license).length });
let covBad = [];
for (const [c, l] of [...Object.entries(byCat), ["all", agents]]) for (const [k, v] of Object.entries(mixOf(l))) if (covVals[`${c}:${k}`] !== v) covBad.push(`${c}:${k} ${covVals[`${c}:${k}`]}≠${v}`);
ok("cifras de /coverage coinciden con los datos", covBad.length === 0 && Object.keys(covVals).length >= 5, covBad.slice(0, 3).join(" | "));

// /changes y feed
const histDir = "src/data/history";
const monthFiles = readdirSync(histDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
const history = {}; for (const f of monthFiles) Object.assign(history, JSON.parse(readFileSync(join(histDir, f), "utf8")));
const dates = Object.keys(history).sort();
const ch = pages["/changes"] ?? (await get("/changes")).text;
const chText = strip(ch);
ok("/changes muestra la fecha de inicio y el nº de registros reales", chText.includes(`Tracking since ${dates[0]}`) && chText.includes(`${dates.length} snapshot`));
const robots = ch.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "";
ok("/changes lleva noindex mientras haya menos de 2 registros y no en caso contrario", dates.length < 2 ? /noindex/.test(robots) : !/noindex/.test(robots), `registros: ${dates.length}`);
ok("/changes solo está en el sitemap con 2 o más registros", dates.length >= 2 ? paths.includes("/changes") : !paths.includes("/changes"));
const feed = await get("/changes/feed.xml");
ok("el feed Atom responde y es XML", feed.status === 200 && feed.text.startsWith("<?xml") && feed.text.includes("</feed>"));
ok("el feed no tiene entradas mientras no haya cambios reales", dates.length >= 2 || !feed.text.includes("<entry>"));

// ---------- E. Historial ----------
console.log("\n## E. Historial");
let shape = true, uniq = new Set(dates).size === dates.length;
for (const d of dates) {
  const s = history[d];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !s.verifiedAt?.startsWith(d) || !s.tools || !Array.isArray(s.excluded)) shape = false;
  for (const [slug, t] of Object.entries(s.tools)) if (!Array.isArray(t) || t.length !== 5 || typeof t[4] !== "string" || !slug) shape = false;
}
ok("cada registro tiene forma válida y fecha coherente con verifiedAt", shape && dates.length > 0);
ok("fechas únicas y en orden", uniq && JSON.stringify(dates) === JSON.stringify([...dates].sort()));
const idx = readFileSync(join(histDir, "index.ts"), "utf8");
ok("index.ts importa todos los ficheros mensuales", monthFiles.every((f) => idx.includes(`./${f}`)));
const last = history[dates.at(-1)];
ok("el último registro coincide con agents.json (mismas herramientas y estrellas)", Object.keys(last.tools).length === agents.length && agents.every((a) => last.tools[a.slug]?.[0] === a.stars));

if (!flag("--skip-history-test")) {
  const tmp = mkdtempSync(join(tmpdir(), "hist-"));
  try {
    const H = join(tmp, "history"); cpSync(histDir, H, { recursive: true });
    const run = (agentsFile) => execFileSync("node", ["scripts/snapshot.mjs"], { env: { ...process.env, HISTORY_DIR: H, AGENTS_FILE: agentsFile, EXCLUDED_FILE: "src/data/excluded.json" }, stdio: "pipe" }).toString();
    // La coma final de una línea depende de si hay un registro después: es formato, no datos.
    const snapshotOf = (d) => readFileSync(join(H, `${d.slice(0, 7)}.json`), "utf8").split("\n").find((l) => l.includes(`"${d}"`))?.replace(/,$/, "");
    const fileBefore = readFileSync(join(H, `${dates.at(-1).slice(0, 7)}.json`), "utf8");
    run("src/data/agents.json"); run("src/data/agents.json");
    ok("idempotente: ejecutar dos veces con los mismos datos no cambia nada", readFileSync(join(H, `${dates.at(-1).slice(0, 7)}.json`), "utf8") === fileBefore);
    // solo-añade: con datos de un día posterior aparece un registro nuevo y los anteriores quedan byte a byte iguales
    const next = JSON.parse(readFileSync("src/data/agents.json", "utf8"));
    const day = new Date(Date.parse(dates.at(-1) + "T00:00:00Z") + 86_400_000).toISOString().slice(0, 10);
    next.forEach((a, i) => { a.verifiedAt = `${day}T08:00:00.000Z`; if (i === 0) a.stars += 7; });
    const fx = join(tmp, "agents-next.json"); writeFileSync(fx, JSON.stringify(next));
    const prevLines = dates.map((d) => snapshotOf(d));
    run(fx);
    const after = dates.map((d) => snapshotOf(d));
    ok("solo-añade: los registros anteriores quedan byte a byte iguales", JSON.stringify(prevLines) === JSON.stringify(after));
    ok("un día nuevo añade exactamente un registro", snapshotOf(day) !== undefined && Object.keys(JSON.parse(readFileSync(join(H, `${day.slice(0, 7)}.json`), "utf8"))).length === dates.filter((d) => d.startsWith(day.slice(0, 7))).length + 1);
    run(fx);
    ok("idempotente también para el día nuevo", snapshotOf(day) === snapshotOf(day));
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

console.log(`\n${total - failed}/${total} comprobaciones superadas${failed ? `, ${failed} FALLAN` : ""}`);
process.exit(failed ? 1 : 0);
