// Sonda mínima para servidores MCP por stdio: arranca el servidor, hace el handshake (initialize) y pide tools/list.
// No usa credenciales: el servidor recibe un entorno vacío (PATH, HOME, LANG) salvo lo que se pase con --env.
// Ejecútala siempre dentro de un contenedor o máquina de pruebas, con datos sintéticos. Imprime un registro listo para pegar en src/content/tests.ts.
//
// Uso:  node scripts/mcp-probe.mjs --slug=playwright-mcp --package=@playwright/mcp@0.0.83 -- npx -y @playwright/mcp@0.0.83
import { spawn } from "node:child_process";
import os from "node:os";

const argv = process.argv.slice(2);
const sep = argv.indexOf("--");
const opts = Object.fromEntries(argv.slice(0, sep === -1 ? argv.length : sep).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split(/=(.*)/s).slice(0, 2)));
const cmd = sep === -1 ? [] : argv.slice(sep + 1);
if (!cmd.length || !opts.slug || !opts.package) {
  console.error("Uso: node scripts/mcp-probe.mjs --slug=<ficha> --package=<paquete@versión> [--env=KEY=VAL] [--environment=\"texto\"] -- <comando del servidor>");
  process.exit(2);
}

const env = { PATH: process.env.PATH ?? "", HOME: process.env.HOME ?? os.homedir(), LANG: "C.UTF-8" };
for (const a of argv.slice(0, sep)) if (a.startsWith("--env=")) { const [k, ...v] = a.slice(6).split("="); env[k] = v.join("="); }

const TIMEOUT = Number(opts.timeout ?? 120) * 1000; // la primera ejecución con npx/uvx descarga el paquete
const started = Date.now();
const child = spawn(cmd[0], cmd.slice(1), { env, stdio: ["pipe", "pipe", "pipe"] });
let stderr = "";
child.stderr.on("data", (d) => { stderr = (stderr + d).slice(-1500); });

const pending = new Map();
let buf = "";
child.stdout.on("data", (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    try {
      const m = JSON.parse(line);
      if (m.id !== undefined && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    } catch { /* línea que no es JSON-RPC: se ignora */ }
  }
});
const send = (m) => child.stdin.write(JSON.stringify(m) + "\n");
const request = (id, method, params) =>
  new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout waiting for ${method}`)), TIMEOUT);
    pending.set(id, (m) => { clearTimeout(t); res(m); });
    send({ jsonrpc: "2.0", id, method, params });
  });

const record = {
  slug: opts.slug,
  testedAt: new Date().toISOString().slice(0, 10),
  package: opts.package,
  client: "mcp-probe",
  clientVersion: "scripts/mcp-probe.mjs (initialize + tools/list)",
  os: `${os.type()} ${os.release()} ${os.arch()}`,
  environment: opts.environment ?? "set with --environment, e.g. Docker node:22-slim, no credentials, synthetic data",
  install: "not-run",
  handshake: "not-run",
  toolsList: { status: "not-run", count: null },
  notes: "",
};
const tools = [];
let server = null;
try {
  const init = await request(1, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "agentshortlist-probe", version: "0.1" } });
  record.install = "pass"; // el proceso arrancó y respondió
  if (init.result?.protocolVersion) {
    record.handshake = "pass";
    server = init.result.serverInfo ?? null;
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    try {
      const list = await request(2, "tools/list", {});
      const t = list.result?.tools ?? [];
      tools.push(...t.map((x) => x.name));
      record.toolsList = { status: Array.isArray(list.result?.tools) ? "pass" : "fail", count: t.length };
    } catch (e) {
      record.toolsList = { status: "fail", count: null };
      record.notes += `tools/list: ${e.message}. `;
    }
  } else {
    record.handshake = "fail";
    record.notes += `initialize returned no protocolVersion. `;
  }
} catch (e) {
  record.install = record.install === "pass" ? "pass" : "fail";
  record.handshake = "fail";
  record.notes += `${e.message}. `;
}
child.kill();
record.notes += `Server reported: ${server ? `${server.name} ${server.version ?? ""}`.trim() : "nothing"}. Took ${((Date.now() - started) / 1000).toFixed(1)} s.`;
if (stderr && record.handshake === "fail") record.notes += ` stderr tail: ${stderr.replace(/\s+/g, " ").slice(-300)}`;

console.log("// Pegar en TESTS de src/content/tests.ts (revisar antes: no incluir rutas ni secretos):");
console.log(JSON.stringify(record, null, 2));
console.log("// Tools reported (" + tools.length + "): " + tools.join(", "));
process.exit(record.handshake === "pass" ? 0 : 1);
