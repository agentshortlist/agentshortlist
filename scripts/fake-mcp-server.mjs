// Servidor MCP sintético (stdio) para la prueba pareada del lote 4. No hace nada real: solo responde a initialize y tools/list.
// Dos variables controlan UNA diferencia cada vez:
//   FAKE_ID     texto que se incrusta en la descripcion (simula un ID de contenedor): diferencia incidental.
//   FAKE_TARGET destino permitido que aparece en el esquema de entrada: diferencia que cambia lo que hace la herramienta.
//   FAKE_ERA    legacy (por defecto: initialize), modern (revision 2026-07-28: server/discover, sin initialize) o dual (las dos).
import readline from "node:readline";
const id = process.env.FAKE_ID ?? "aaaaaaaaaaaa";
const target = process.env.FAKE_TARGET ?? "https://example.invalid/a";
const tools = [{
  name: "fetch_report",
  description: `Fetches a report from the allowed target. Running on host ${id}.`,
  inputSchema: { type: "object", properties: { target: { type: "string", enum: [target], description: "The only allowed target." } }, required: ["target"] },
}];
const era = process.env.FAKE_ERA ?? "legacy";
const MODERN = "2026-07-28";
const out = (m) => process.stdout.write(JSON.stringify(m) + "\n");
const rl = readline.createInterface({ input: process.stdin });
if (process.env.FAKE_DELAY) rl.pause(), setTimeout(() => rl.resume(), Number(process.env.FAKE_DELAY) * 1000); // simula un servidor que tarda en arrancar
rl.on("line", (line) => {
  let m; try { m = JSON.parse(line); } catch { return; }
  const wantsModern = m.params?._meta?.["io.modelcontextprotocol/protocolVersion"];
  if (m.method === "server/discover" && era !== "legacy") {
    out({ jsonrpc: "2.0", id: m.id, result: { resultType: "complete", supportedVersions: era === "dual" ? [MODERN, "2025-11-25"] : [MODERN], capabilities: { tools: {} }, _meta: { "io.modelcontextprotocol/serverInfo": { name: "fake-mcp-server", version: "0.0.1" } } } });
  } else if (m.method === "initialize" && era !== "modern") {
    out({ jsonrpc: "2.0", id: m.id, result: { protocolVersion: m.params?.protocolVersion ?? "2025-03-26", capabilities: { tools: {} }, serverInfo: { name: "fake-mcp-server", version: "0.0.1" } } });
  } else if (m.method === "initialize") {
    out({ jsonrpc: "2.0", id: m.id, error: { code: -32600, message: `This server speaks only ${MODERN}; use server/discover.` } });
  } else if (m.method === "tools/list" && era === "modern" && wantsModern !== MODERN) {
    out({ jsonrpc: "2.0", id: m.id, error: { code: -32022, message: "Unsupported protocol version", data: { supported: [MODERN], requested: wantsModern ?? null } } });
  } else if (m.method === "tools/list") {
    out({ jsonrpc: "2.0", id: m.id, result: { tools } });
  } else if (m.id !== undefined) {
    out({ jsonrpc: "2.0", id: m.id, error: { code: -32601, message: "not found" } });
  }
});
