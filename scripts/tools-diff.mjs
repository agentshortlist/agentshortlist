// Compara dos tools/list guardados con scripts/mcp-probe.mjs (--tools-out). Una variable cada vez:
// herramientas añadidas o quitadas, descripciones cambiadas y esquemas cambiados, y si los hashes coinciden.
// Uso: node scripts/tools-diff.mjs a.json b.json
import { readFileSync } from "node:fs";
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, "utf8")));
if (!a || !b) { console.error("Uso: node scripts/tools-diff.mjs a.json b.json"); process.exit(2); }
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
for (const k of ["descriptions", "schemas", "all"]) console.log(`sha256 ${k}: ${a.hashes[k] === b.hashes[k] ? "IDENTICAL" : "DIFFERENT"}\n  A ${a.hashes[k]}\n  B ${b.hashes[k]}`);
