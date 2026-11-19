// Fase 1 de la prueba de telemetria (CON internet): instala el paquete en la cache SIN ejecutarlo.
// Asi no se envia nada a nadie: el servidor solo se ejecuta despues, en la fase 2, sin salida a internet.
// Uso (dentro del contenedor, carpeta /work, cache en el volumen /cache): node scripts/telemetry-warm.mjs <id>
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";

const id = process.argv[2];
const list = JSON.parse(readFileSync("docs/testing/telemetry/servers.json", "utf8"));
const s = list.find((x) => x.id === id);
if (!s) { console.log(`WARM ${id}: no esta en servers.json`); process.exit(0); }
const dir = `/cache/pkgs/${id}`;
if (existsSync(`${dir}/.ok`)) { console.log(`WARM ${id}: ya instalado`); process.exit(0); }
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });
const run = (cmd, args, env = {}) => spawnSync(cmd, args, { encoding: "utf8", env: { ...process.env, ...env }, timeout: 600000 });
let r, info = {};
if (s.kind === "node") {
  r = run("npm", ["install", "--prefix", dir, "--no-audit", "--no-fund", `${s.pkg}@${s.ver}`], { npm_config_cache: "/cache/npm" });
  if (r.status === 0) {
    const pj = JSON.parse(readFileSync(`${dir}/node_modules/${s.pkg}/package.json`, "utf8"));
    const unscoped = s.pkg.split("/").pop();
    const bin = typeof pj.bin === "string" ? unscoped : Object.keys(pj.bin ?? {}).find((k) => k === unscoped) ?? Object.keys(pj.bin ?? {})[0];
    info = { bin, installed: pj.version };
  }
} else {
  r = run("uv", ["tool", "install", "--python", s.python ?? "3.12", `${s.pkg}==${s.ver}`], { UV_CACHE_DIR: "/cache/uv", UV_TOOL_DIR: "/cache/uvtools", UV_TOOL_BIN_DIR: "/cache/uvbin", UV_PYTHON_INSTALL_DIR: "/cache/uvpython" });
  info = { bin: s.exe, installed: s.ver };
}
if (r.status === 0) { writeFileSync(`${dir}/.ok`, JSON.stringify(info)); console.log(`WARM ${id}: OK ${JSON.stringify(info)}`); }
else { writeFileSync(`${dir}/.fail`, (r.stderr || r.stdout || "").slice(-600)); console.log(`WARM ${id}: FALLO ${(r.stderr || "").slice(-200).replace(/\s+/g, " ")}`); }
