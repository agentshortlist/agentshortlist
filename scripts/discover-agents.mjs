// Descubre candidatos con la API de búsqueda de GitHub (10 req/min sin token).
// Guarda las respuestas crudas en scripts/.cache/github-repos.json (fetchedAt por repo) y imprime una lista
// para curar a mano. No decide nada: la curación final es editorial y vive en scripts/fetch-agents.mjs.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const MAX_AGE_DAYS = 90;
const MIN_STARS = Number(process.env.MIN_STARS ?? 800);
const since = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString().slice(0, 10);

const QUERIES = {
  coding: ["topic:coding-agent", "topic:ai-coding", "topic:claude-code topic:agent", "topic:ai-pair-programming", "topic:codex topic:cli agent in:description", "topic:code-generation topic:agent"],
  research: ["topic:deep-research", '"deep research" agent in:description'],
  browser: ["topic:browser-automation ai agent in:description", "topic:computer-use"],
  "mcp-database": ["topic:mcp database in:description", "topic:mcp-server sql in:description"],
  "mcp-general": ["topic:mcp-server", "topic:model-context-protocol", "topic:mcp-client", "topic:mcp topic:server in:description"],
  frameworks: ["topic:agent-framework", "topic:ai-agents framework in:description", "topic:agentic-ai", "topic:multi-agent", "topic:llm-agent"],
  data: ["topic:data-analysis llm agent in:description", "topic:text-to-sql llm"],
  testing: ["ai agent testing qa in:description topic:testing"],
  devops: ["ai sre agent in:description", "topic:aiops llm"],
  assistants: ["topic:personal-assistant topic:ai-agent", "topic:ai-assistant autonomous agent in:description"],
};

const headers = { Accept: "application/vnd.github+json", "User-Agent": "agentshortlist-build" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const NOISE = /awesome|tutorial|course|cheatsheet|roadmap|prompts?\b|examples?\b|cookbook|workshop|interview/i;

let cache = {};
try {
  cache = JSON.parse(await readFile("scripts/.cache/github-repos.json", "utf8"));
} catch {}

const out = {};
for (const [group, qs] of Object.entries(QUERIES)) {
  if (process.env.ONLY && process.env.ONLY !== group) continue;
  out[group] = new Map();
  for (const q of qs) {
    const full = `${q} stars:>=${MIN_STARS} pushed:>=${since} archived:false fork:false`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(full)}&sort=stars&order=desc&per_page=${process.env.PER_PAGE ?? 30}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`FAILED ${group} "${q}": HTTP ${res.status}`);
      continue;
    }
    const { items } = await res.json();
    for (const r of items) {
      if (NOISE.test(r.name) || !r.description) continue;
      cache[r.full_name] = {
        full_name: r.full_name,
        name: r.name,
        description: r.description,
        homepage: r.homepage,
        html_url: r.html_url,
        license: r.license ? { spdx_id: r.license.spdx_id } : null,
        stargazers_count: r.stargazers_count,
        pushed_at: r.pushed_at,
        archived: r.archived,
        fetchedAt: new Date().toISOString(),
      };
      out[group].set(r.full_name, cache[r.full_name]);
    }
    await new Promise((r) => setTimeout(r, 7000)); // 10 req/min
  }
}

await mkdir("scripts/.cache", { recursive: true });
await writeFile("scripts/.cache/github-repos.json", JSON.stringify(cache, null, 2) + "\n");

for (const [group, m] of Object.entries(out)) {
  console.log(`\n## ${group} (${m.size})`);
  for (const r of [...m.values()].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 25)) {
    console.log(
      `${r.full_name.padEnd(46)} ${String(r.stargazers_count).padStart(7)} ${r.pushed_at.slice(0, 10)} ${String(r.license?.spdx_id ?? "-").padEnd(12)} ${r.description.slice(0, 70)}`,
    );
  }
}
