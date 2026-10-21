// Consulta avisos de seguridad publicados (OSV.dev) para los paquetes de las fichas verificadas.
// Solo incluye un paquete si existe en su registro y su repositorio coincide con el de la ficha: un nombre equivocado
// devolvería "0 avisos" y sería engañoso. Uso: node scripts/osv-check.mjs  (escribe src/content/advisories.json)
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const MAP = [
  ["github-mcp-server", "Go", "github.com/github/github-mcp-server", "github/github-mcp-server"],
  ["playwright-mcp", "npm", "@playwright/mcp", "playwright-mcp"],
  ["desktop-commander-mcp", "npm", "@wonderwhy-er/desktop-commander", "desktopcommandermcp"],
  ["mysql-mcp-server", "PyPI", "mysql-mcp-server", "mysql_mcp_server"],
  ["context7", "npm", "@upstash/context7-mcp", "context7"],
  ["chrome-devtools-mcp", "npm", "chrome-devtools-mcp", "chrome-devtools-mcp"],
  ["n8n-mcp", "npm", "n8n-mcp", "n8n-mcp"],
  ["firecrawl-mcp-server", "npm", "firecrawl-mcp", "firecrawl-mcp-server"],
  ["mongodb-mcp-server", "npm", "mongodb-mcp-server", "mongodb-mcp-server"],
  ["dbhub", "npm", "@bytebase/dbhub", "dbhub"],
  ["browser-tools-mcp", "npm", "@agentdeskai/browser-tools-mcp", "browser-tools-mcp"],
  ["apify-mcp-server", "npm", "@apify/actors-mcp-server", "apify-mcp-server"],
  ["blender-mcp", "PyPI", "mcp-for-blender", "blender-mcp"], // el repositorio se renombró (blender-mcp → mcp-for-blender), mismo autor
  ["ida-pro-mcp", "PyPI", "ida-pro-mcp", "ida-pro-mcp"],
  ["context-mode", "npm", "context-mode", "context-mode"],
  ["serena", "PyPI", "serena-agent", "serena"],
  ["unity-mcp", "PyPI", "mcpforunityserver", "unity-mcp"],
  ["codebase-memory-mcp", "npm", "codebase-memory-mcp", "codebase-memory-mcp"],
  ["graphjin", "npm", "graphjin", "graphjin"],
  ["mcp-reference-servers", "npm", "@modelcontextprotocol/server-filesystem", "servers"],
  ["mcp-reference-servers", "npm", "@modelcontextprotocol/server-memory", "servers"],
  ["mcp-reference-servers", "npm", "@modelcontextprotocol/server-everything", "servers"],
  ["mcp-reference-servers", "PyPI", "mcp-server-git", "servers"],
  ["mcp-reference-servers", "PyPI", "mcp-server-fetch", "servers"],
  ["supabase-mcp", "npm", "@supabase/mcp-server-supabase", "supabase/mcp"],
  ["notion-mcp-server", "npm", "@notionhq/notion-mcp-server", "makenotion/notion-mcp-server"],
  ["terraform-mcp-server", "Go", "github.com/hashicorp/terraform-mcp-server", "hashicorp/terraform-mcp-server"],
  ["bright-data-mcp", "npm", "@brightdata/mcp", "brightdata/brightdata-mcp"],
  ["exa-mcp-server", "npm", "exa-mcp-server", "exa-labs/exa-mcp-server"],
  ["tavily-mcp", "npm", "tavily-mcp", "tavily-ai/tavily-mcp"],
  ["framelink-mcp-for-figma", "npm", "figma-developer-mcp", "glips/figma-context-mcp"],
  ["grafana-mcp-server", "PyPI", "mcp-grafana", "grafana/mcp-grafana"],
  ["google-workspace-mcp", "PyPI", "workspace-mcp", "google_workspace_mcp"],
  ["perplexity-mcp-server", "npm", "@perplexity-ai/mcp-server", "perplexityai/modelcontextprotocol"],
  ["redis-mcp-server", "PyPI", "redis-mcp-server", "redis/mcp-redis"],
  ["qdrant-mcp-server", "PyPI", "mcp-server-qdrant", "qdrant/mcp-server-qdrant"],
  ["neon-mcp-server", "npm", "@neondatabase/mcp-server-neon", "mcp-server-neon"],
  ["motherduck-mcp-server", "PyPI", "mcp-server-motherduck", "mcp-server-motherduck"],
  ["stripe-agent-toolkit", "npm", "@stripe/mcp", "stripe/ai"],
  ["kubernetes-mcp-server", "npm", "kubernetes-mcp-server", "containers/kubernetes-mcp-server"],
  ["kubernetes-mcp-server", "PyPI", "kubernetes-mcp-server", "containers/kubernetes-mcp-server"],
  ["kubernetes-mcp-server", "Go", "github.com/containers/kubernetes-mcp-server", "containers/kubernetes-mcp-server"],
  ["mcp-server-kubernetes", "npm", "mcp-server-kubernetes", "flux159/mcp-server-kubernetes"],
  ["home-assistant-mcp-server", "PyPI", "ha-mcp", "homeassistant-ai/ha-mcp"],
];

// Reintenta ante fallos de red o del servicio. Un error nunca debe convertirse en "0 avisos": se aborta sin escribir nada.
async function get(url, init) {
  let last;
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
      if (r.status === 404 || r.ok) return r;
      last = new Error(`${url} -> ${r.status}`);
    } catch (e) {
      last = e;
    }
    await new Promise((res) => setTimeout(res, 1500 * (i + 1)));
  }
  throw last;
}

async function latest(eco, name) {
  if (eco === "Go") return { version: null, ok: true };
  if (eco === "npm") {
    const r = await get("https://registry.npmjs.org/" + name.replace("/", "%2F"));
    if (r.status !== 200) return { ok: false, why: "not in registry" };
    const j = await r.json();
    return { version: j["dist-tags"]?.latest, ok: JSON.stringify(j.repository || "").toLowerCase().includes(MATCH) };
  }
  const r = await get(`https://pypi.org/pypi/${name}/json`);
  if (r.status !== 200) return { ok: false, why: "not in registry" };
  const j = await r.json();
  const blob = (JSON.stringify(j.info.project_urls || {}) + (j.info.home_page || "")).toLowerCase();
  return { version: j.info.version, ok: blob.includes(MATCH) };
}
let MATCH = "";

async function osv(body) {
  const out = [];
  let token;
  do {
    const r = await get("https://api.osv.dev/v1/query", { method: "POST", body: JSON.stringify({ ...body, ...(token ? { page_token: token } : {}) }) });
    const j = await r.json();
    out.push(...(j.vulns ?? []));
    token = j.next_page_token;
  } while (token);
  return out;
}

const fixedFor = (v, eco, name) => {
  const fixed = [];
  for (const a of v.affected ?? []) {
    if (a.package?.name?.toLowerCase() !== name.toLowerCase() || a.package?.ecosystem?.toLowerCase() !== eco.toLowerCase()) continue;
    for (const r of a.ranges ?? []) for (const e of r.events ?? []) if (e.fixed) fixed.push(e.fixed);
  }
  return [...new Set(fixed)];
};

const slim = (v, eco, name) => ({
  id: v.id,
  aliases: (v.aliases ?? []).filter((x) => x.startsWith("CVE-")),
  summary: (v.summary ?? "").slice(0, 200),
  severity: v.database_specific?.severity ?? null,
  published: (v.published ?? "").slice(0, 10),
  fixedIn: fixedFor(v, eco, name),
  ranges: (v.affected ?? [])
    .filter((a) => a.package?.name?.toLowerCase() === name.toLowerCase())
    .flatMap((a) => (a.ranges ?? []).filter((r) => r.type === "SEMVER" || r.type === "ECOSYSTEM").map((r) => r.events)),
});

const items = {};
const skipped = [];
for (const [slug, eco, name, match] of MAP) {
  MATCH = match.toLowerCase();
  const lat = await latest(eco, name);
  if (!lat.ok) { skipped.push(`${slug}: ${eco} ${name} (${lat.why ?? "repository does not match"})`); continue; }
  const all = (await osv({ package: { name, ecosystem: eco } })).filter((v) => !v.withdrawn);
  const hitLatest = lat.version ? (await osv({ package: { name, ecosystem: eco }, version: lat.version })).filter((v) => !v.withdrawn) : null;
  (items[slug] ??= []).push({
    ecosystem: eco,
    name,
    latest: lat.version,
    total: all.length,
    affectingLatest: hitLatest ? hitLatest.length : null,
    vulns: all.map((v) => slim(v, eco, name)).sort((a, b) => b.published.localeCompare(a.published)),
  });
}
// Si faltan muchos paquetes respecto a la última comprobación, algo falló: se conserva el archivo anterior.
const FILE = "src/content/advisories.json";
if (existsSync(FILE)) {
  const prev = Object.values(JSON.parse(readFileSync(FILE, "utf8")).items).flat().length;
  const now = Object.values(items).flat().length;
  if (now < prev * 0.8) {
    console.error(`Abortado: ${now} paquetes frente a ${prev} en la comprobación anterior (${skipped.join("; ")})`);
    process.exit(1);
  }
}
writeFileSync(FILE, JSON.stringify({ checkedAt: new Date().toISOString().slice(0, 10), source: "https://osv.dev", items }, null, 1));
console.log("packages:", Object.values(items).flat().length, "skipped:", skipped);
for (const [slug, ps] of Object.entries(items)) for (const p of ps) console.log(slug.padEnd(24), p.name.padEnd(40), "total", p.total, "latest", p.latest, "affecting-latest", p.affectingLatest);
