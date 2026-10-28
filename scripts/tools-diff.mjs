// Compara dos tools/list guardados con scripts/mcp-probe.mjs (--tools-out). Una variable cada vez:
// herramientas añadidas o quitadas, descripciones cambiadas y esquemas cambiados, y si los hashes coinciden.
// Uso: node scripts/tools-diff.mjs a.json b.json [--normalize]
// --normalize sustituye cualquier cadena de 12 caracteres hexadecimales (el ID corto de un contenedor Docker, como pasa en Desktop Commander)
// por <ID12> antes de comparar y de calcular los hashes. Se usa solo para explicar una diferencia entre entornos; el resultado normalizado se declara como tal.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const args = process.argv.slice(2);
const normalize = args.includes("--normalize");
const [a, b] = args.filter((x) => !x.startsWith("--")).map((f) => JSON.parse(readFileSync(f, "utf8")));
if (!a || !b) { console.error("Uso: node scripts/tools-diff.mjs a.json b.json [--normalize]"); process.exit(2); }
const ID12 = /\b[0-9a-f]{12}\b/g;
if (normalize) for (const x of [a, b]) x.tools = JSON.parse(JSON.stringify(x.tools).replace(ID12, "<ID12>"));
const by = (x) => new Map(x.tools.map((t) => [t.name, t]));
const A = by(a), B = by(b);
const added = [...B.keys()].filter((k) => !A.has(k));
const removed = [...A.keys()].filter((k) => !B.has(k));
const common = [...A.keys()].filter((k) => B.has(k));
const canon = (v) => JSON.stringify(v, (_, x) => (x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x));
const descChanged = common.filter((k) => (A.get(k).description ?? "") !== (B.get(k).description ?? ""));
const schemaChanged = common.filter((k) => canon(A.get(k).inputSchema ?? null) !== canon(B.get(k).inputSchema ?? null));
console.log(`A: ${a.package} (${a.tools.length} tools)\nB: ${b.package} (${b.tools.length} tools)\n`);
console.log("Tools only in B:", added.length ? added.join(", ") : "none");
console.log("Tools only in A:", removed.length ? removed.join(", ") : "none");
console.log("Descriptions changed:", descChanged.length ? descChanged.join(", ") : "none");
console.log("Schemas changed:", schemaChanged.length ? schemaChanged.join(", ") : "none");
// Misma canonicalización que mcp-probe.mjs: herramientas ordenadas por nombre y claves ordenadas.
const sha = (v) => createHash("sha256").update(canon(v)).digest("hex");
const hashesOf = (x) => {
  if (!normalize) return x.hashes;
  const s = [...x.tools].sort((p, q) => String(p.name).localeCompare(String(q.name)));
  return { descriptions: sha(s.map((t) => ({ name: t.name, description: t.description ?? "" }))), schemas: sha(s.map((t) => ({ name: t.name, inputSchema: t.inputSchema ?? null }))), all: sha(s) };
};
const ha = hashesOf(a), hb = hashesOf(b);
if (normalize) console.log("NORMALIZED: 12-hex strings replaced by <ID12> before comparing.\n");
// Dónde empieza la diferencia en cada descripción distinta, para poder explicarla.
for (const k of descChanged) {
  const x = A.get(k).description ?? "", y = B.get(k).description ?? "";
  let i = 0; while (i < x.length && x[i] === y[i]) i++;
  console.log(`First difference in "${k}" at char ${i}:\n  A ...${JSON.stringify(x.slice(Math.max(0, i - 30), i + 50))}\n  B ...${JSON.stringify(y.slice(Math.max(0, i - 30), i + 50))}`);
}
for (const k of ["descriptions", "schemas", "all"]) console.log(`sha256 ${k}: ${ha[k] === hb[k] ? "IDENTICAL" : "DIFFERENT"}\n  A ${ha[k]}\n  B ${hb[k]}`);
