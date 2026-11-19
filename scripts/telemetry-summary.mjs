// Resume la prueba de telemetria: por cada servidor y variante, a que nombres intento conectarse (DNS, TLS y HTTP) y cuando.
// Uso: node scripts/telemetry-summary.mjs [carpeta=out/telemetry]   -> imprime el resumen; ademas escribe summary.json en la carpeta.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const dir = process.argv[2] ?? "out/telemetry";
const WINDOW = Number(process.argv[3] ?? 0);
const runs = readdirSync(dir).filter((f) => f.endsWith(".sink.log")).map((f) => f.replace(/\.sink\.log$/, "")).sort();
const out = [];
for (const base of runs) {
  const lines = readFileSync(`${dir}/${base}.sink.log`, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const probePath = `${dir}/${base}.probe.txt`;
  const probe = existsSync(probePath) ? readFileSync(probePath, "utf8") : "";
  const ready = lines.find((l) => l.kind === "ready")?.t;
  const holdStart = probe.match(/HOLD-START (\S+)/)?.[1];
  const t0 = ready ? Date.parse(ready) : 0;
  const sec = (t) => Math.round((Date.parse(t) - t0) / 100) / 10;
  const names = new Map();
  for (const l of lines) {
    if (l.kind === "dns") { const n = names.get(l.name) ?? { name: l.name, first: sec(l.t), dns: 0, tls: 0, http: [], sni: false }; n.dns++; names.set(l.name, n); }
    if (l.kind === "tls" && l.sni) { const n = names.get(l.sni) ?? { name: l.sni, first: sec(l.t), dns: 0, tls: 0, http: [] }; n.tls++; names.set(l.sni, n); }
    if (l.kind === "http") { const key = (l.host || "?").replace(/:\d+$/, "").toLowerCase(); const n = names.get(key) ?? { name: key, first: sec(l.t), dns: 0, tls: 0, http: [] }; n.http.push(`${l.method} ${l.path} (cuerpo ${l.bodyBytes} B)`); names.set(key, n); }
  }
  const handshake = probe.match(/"handshake": "(\w[\w-]*)"/)?.[1] ?? (probe.startsWith("NO-INSTALADO") ? "no-instalado" : "?");
  const tools = probe.match(/"toolsList": \{\s*"status": "(\w+)",\s*"count": (\w+)/);
  const server = probe.match(/Server reported: ([^.]*(?:\.\d+)*[^.]*)\./)?.[1]?.trim();
  const startupEnd = holdStart ? Date.parse(holdStart) : null;
  out.push({
    run: base, handshake, tools: tools ? `${tools[1]} (${tools[2]})` : "-", server: server ?? "-",
    startupNote: holdStart ? "los tiempos son segundos desde que el sumidero esta listo; HOLD-START marca el fin de tools/list" : "sin HOLD-START (la sonda no llego a tools/list)",
    holdStartSec: holdStart ? sec(holdStart) : null,
    contacts: [...names.values()].sort((a, b) => a.first - b.first),
    detail: handshake !== "pass" && !probe.startsWith("NO-INSTALADO") ? (probe.match(/stderr tail: ([^"]{0,300})/)?.[1] ?? "").trim() : "",
    installNote: probe.startsWith("NO-INSTALADO") ? probe.slice(0, 300).replace(/\s+/g, " ") : "",
  });
}
writeFileSync(`${dir}/summary.json`, JSON.stringify(out, null, 1));
for (const r of out) {
  console.log(`\n=== ${r.run}`);
  console.log(`  handshake: ${r.handshake} | tools/list: ${r.tools} | servidor: ${r.server}${r.holdStartSec != null ? ` | fin de tools/list a los ${r.holdStartSec} s` : ""}`);
  if (r.installNote) console.log(`  ${r.installNote}`);
  if (r.detail) console.log(`  detalle del fallo: ${r.detail}`);
  if (!r.contacts.length) console.log("  nombres contactados: NINGUNO");
  for (const c of r.contacts) console.log(`  - ${c.name}${r.holdStartSec != null && WINDOW && c.first >= r.holdStartSec + WINDOW - 1 ? "  [AL CERRAR la sonda el proceso]" : ""}  (primera vez a los ${c.first} s; DNS ${c.dns}${c.tls ? `, TLS ${c.tls}` : ""}${c.http.length ? `, HTTP: ${c.http.join("; ")}` : ""})`);
}
console.log(`\n${out.length} ejecuciones resumidas`);
