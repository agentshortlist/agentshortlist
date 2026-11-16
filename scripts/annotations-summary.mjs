// Resume las anotaciones (readOnlyHint, destructiveHint, idempotentHint, openWorldHint) de los archivos *.tools.json que guarda mcp-probe con --tools-out.
// Sirve para contar cuantas herramientas declaran la anotacion y compararlo con las que desaparecen al activar un ajuste de solo lectura.
// Uso: node scripts/annotations-summary.mjs out/**/*.tools.json   (o una lista de archivos)
import { readFileSync } from "node:fs";
const files = process.argv.slice(2);
if (!files.length) { console.log("Uso: node scripts/annotations-summary.mjs archivo1.tools.json [archivo2 ...]"); process.exit(1); }
for (const f of files) {
  let j; try { j = JSON.parse(readFileSync(f, "utf8")); } catch (e) { console.log(`${f}: no se pudo leer (${e.message})`); continue; }
  const tools = j.tools ?? [];
  const withAnn = tools.filter((t) => t.annotations && Object.keys(t.annotations).length);
  const tally = (k) => { const c = { true: 0, false: 0, unset: 0 }; for (const t of tools) { const v = t.annotations?.[k]; c[v === true ? "true" : v === false ? "false" : "unset"]++; } return c; };
  console.log(`\n## ${f}\n${j.package ?? ""}  herramientas: ${tools.length}  con alguna anotacion: ${withAnn.length}`);
  for (const k of ["readOnlyHint", "destructiveHint", "idempotentHint", "openWorldHint"]) console.log(`  ${k}: true=${tally(k).true} false=${tally(k).false} sin definir=${tally(k).unset}`);
  for (const t of tools) console.log(`    ${t.name}: ${t.annotations ? JSON.stringify(t.annotations) : "(sin anotaciones)"}`);
}
