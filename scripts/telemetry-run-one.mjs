// Fase 2 de la prueba de telemetria (SIN internet): arranca el servidor ya instalado, comparte la red con el sumidero y lo deja vivo --hold segundos.
// Uso (dentro del contenedor, carpeta /work): node scripts/telemetry-run-one.mjs <id|control> <default|optout> <segundos>
// Escribe out/telemetry/<id>.<variante>.probe.txt (salida de la sonda) y .tools.json; el sumidero escribe el .sink.log aparte.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const [id, variant = "default", hold = "40"] = process.argv.slice(2);
mkdirSync("out/telemetry", { recursive: true });
const base = `out/telemetry/${id}.${variant}`;
// Todas las consultas DNS van al sumidero (127.0.0.1 dentro de la red compartida).
try { writeFileSync("/etc/resolv.conf", "nameserver 127.0.0.1\n"); } catch (e) { console.log("RESOLV no escribible: " + e.message); }

if (id === "control") {
  // Control del propio montaje: un "servidor" que contacta dos nombres, uno por TLS y otro por HTTP. Si no salen en el registro, la prueba no vale.
  const code = `fetch("https://telemetry.control.test/e",{method:"POST",body:"x"}).catch(()=>{});fetch("http://plain.control.test/e",{method:"POST",body:"abc"}).catch(()=>{});setTimeout(()=>{},4000)`;
  const r = spawnSync("node", ["-e", code], { encoding: "utf8", timeout: 20000 });
  writeFileSync(`${base}.probe.txt`, `control: ${r.status}\n`);
  process.exit(0);
}

const list = JSON.parse(readFileSync("docs/testing/telemetry/servers.json", "utf8"));
const s = list.find((x) => x.id === id);
const v = variant === "default" ? { args: [], env: [] } : variant === "optout" ? s.optout : s.variants?.[variant];
if (!v) { writeFileSync(`${base}.probe.txt`, `VARIANTE-DESCONOCIDA: ${variant}\n`); process.exit(0); }
for (const f of v.files ?? []) { mkdirSync(dirname(f.path), { recursive: true }); writeFileSync(f.path, f.content); }
const dir = `/cache/pkgs/${id}`;
if (!s || !existsSync(`${dir}/.ok`)) {
  writeFileSync(`${base}.probe.txt`, `NO-INSTALADO: ${existsSync(`${dir}/.fail`) ? readFileSync(`${dir}/.fail`, "utf8") : "sin intento de instalacion"}\n`);
  process.exit(0);
}
const info = JSON.parse(readFileSync(`${dir}/.ok`, "utf8"));
const exe = s.kind === "node" ? `${dir}/node_modules/.bin/${info.bin}` : `/cache/uvbin/${s.exe}`;
const args = [...s.args, ...v.args];
const envs = [...s.env, ...v.env];
const probe = [
  "scripts/mcp-probe.mjs", `--slug=${s.slug}`, `--package=${s.pkg}@${s.ver}`, "--timeout=90", `--hold=${hold}`,
  `--tools-out=${base}.tools.json`, `--record-out=${base}.record.json`,
  `--environment=Docker node:22-slim, no internet (all names resolve to a local sink), filler credentials, variant ${variant}${v.note ? " (" + v.note + ")" : ""}`,
  ...envs.map((e) => `--env=${e}`),
  "--", exe, ...args,
];
const r = spawnSync("node", probe, { encoding: "utf8", timeout: (90 + Number(hold) + 120) * 1000 });
writeFileSync(`${base}.probe.txt`, `${r.stdout ?? ""}\n${r.stderr ?? ""}\n`);
console.log(`RUN ${id} ${variant}: salida ${r.status}`);
