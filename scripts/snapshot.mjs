// Añade al historial un registro por fecha de datos (UTC) con las señales crudas de cada herramienta.
//  - La fecha es la de verificación de los datos en agents.json, no la fecha del reloj: no se inventa nada.
//  - Idempotente: ejecutarlo dos veces con los mismos datos deja exactamente un registro para esa fecha.
//  - Solo se escribe el fichero del mes de ese registro; los demás meses no se tocan.
//  - Regenera src/data/history/index.ts (importaciones explícitas, que Next/Vercel sabe incluir en el build).
// Variables para pruebas: AGENTS_FILE, EXCLUDED_FILE, HISTORY_DIR.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const AGENTS = process.env.AGENTS_FILE ?? "src/data/agents.json";
const EXCLUDED = process.env.EXCLUDED_FILE ?? "src/data/excluded.json";
const DIR = process.env.HISTORY_DIR ?? "src/data/history";
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const agents = JSON.parse(readFileSync(AGENTS, "utf8"));
const excluded = existsSync(EXCLUDED) ? JSON.parse(readFileSync(EXCLUDED, "utf8")) : [];
if (!agents.length) throw new Error("agents.json está vacío: no se guarda ningún registro");

const verifiedAt = agents.map((a) => a.verifiedAt).sort().at(-1);
const date = verifiedAt.slice(0, 10);
const month = date.slice(0, 7);

const tools = {};
for (const a of [...agents].sort((x, y) => x.slug.localeCompare(y.slug))) {
  tools[a.slug] = [a.stars ?? null, a.lastPush ?? null, a.license ?? null, a.archived ? 1 : 0, a.category];
}
const snap = {
  verifiedAt,
  tools,
  excluded: excluded.map((e) => ({ slug: slugify(e.name), name: e.name, reason: e.reason, daysSincePush: e.daysSincePush })),
};

mkdirSync(DIR, { recursive: true });
const file = join(DIR, `${month}.json`);
const current = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
const before = JSON.stringify(current[date] ?? null);
current[date] = snap;

// Un registro por línea: los diffs de git quedan legibles y el fichero crece de forma predecible.
const lines = Object.keys(current).sort().map((d) => `  ${JSON.stringify(d)}: ${JSON.stringify(current[d])}`);
writeFileSync(file, `{\n${lines.join(",\n")}\n}\n`);

const months = readdirSync(DIR).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
const ident = (m) => `m${m.replace(".json", "").replace("-", "_")}`;
const index =
  `// Generado por scripts/snapshot.mjs: no editar a mano.\n` +
  `import type { History } from "@/lib/history-core";\n` +
  months.map((m) => `import ${ident(m)} from "./${m}";`).join("\n") +
  `\n\nexport const HISTORY = {\n${months.map((m) => `  ...${ident(m)},`).join("\n")}\n} as unknown as History;\n`;
writeFileSync(join(DIR, "index.ts"), index);

const changed = before !== JSON.stringify(snap);
console.log(`snapshot ${date}: ${Object.keys(tools).length} herramientas, ${snap.excluded.length} excluidas (${changed ? "registro escrito" : "sin cambios"}), meses: ${months.join(", ")}`);
