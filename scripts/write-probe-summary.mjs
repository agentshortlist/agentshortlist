// Resume una pasada de llamadas: une el archivo de llamadas (con etiquetas) con el --record-out de mcp-probe y, en Blender, con el registro del falso socket.
// Uso: node scripts/write-probe-summary.mjs <calls.json> <record.json> [socket.log]
import { readFileSync, existsSync } from "node:fs";
const [callsFile, recFile, sockFile] = process.argv.slice(2);
const calls = JSON.parse(readFileSync(callsFile, "utf8"));
const rec = JSON.parse(readFileSync(recFile, "utf8"));
const res = rec.callResults ?? [];
const sock = sockFile && existsSync(sockFile) ? readFileSync(sockFile, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : null;
const reached = (code) => (sock ? sock.some((s) => s.code === code) : null);
console.log(`herramientas anunciadas: ${rec.toolNames?.length ?? "?"}  (${(rec.toolNames ?? []).join(", ")})`);
calls.forEach((c, i) => {
  const r = res[i]; const raw = r?.raw;
  const text = raw?.result?.content?.map((x) => x.text ?? "").join(" ").replace(/\s+/g, " ").slice(0, 170) ?? (raw?.error ? `JSON-RPC error: ${raw.error.message}` : r?.note ?? "sin respuesta");
  const flag = raw?.result?.isError ? "isError" : raw?.error ? "rpc-error" : r ? "ok" : "-";
  const sk = c.tool === "execute_blender_code" ? ` | llego al socket: ${reached(c.arguments.code) === null ? "?" : reached(c.arguments.code) ? "SI" : "no"}` : "";
  console.log(`- ${c.label ?? c.tool} -> [${flag}]${sk}\n    ${text}`);
});
