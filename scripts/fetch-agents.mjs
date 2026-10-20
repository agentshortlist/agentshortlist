// Genera src/data/agents.json a partir de la API pública de GitHub.
// Los datos factuales (estrellas, último push, licencia, descripción) salen solo de la API:
// o de scripts/.cache/github-repos.json (respuestas de la API con fetchedAt, <24 h) o de una consulta a /repos.
// Lo que la API no devuelve se deja en null; nunca se rellena a mano.
// La lista SEED es la curación editorial; la regla pública de inclusión se aplica después.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const MAX_AGE_DAYS = 90;
// 20 h y no 24 h: la sincronización diaria tarda unos minutos y con 24 h parte de las herramientas se reutilizaba de la caché un día sí y otro no.
const CACHE_TTL_MS = 20 * 3600 * 1000;

// [repo, categoría, nombre visible]
const SEED = [
  // coding-agents
  ["cline/cline", "coding-agents", "Cline"],
  ["All-Hands-AI/OpenHands", "coding-agents", "OpenHands"],
  ["Aider-AI/aider", "coding-agents", "Aider"],
  ["openai/codex", "coding-agents", "OpenAI Codex CLI"],
  ["anthropics/claude-code", "coding-agents", "Claude Code"],
  ["block/goose", "coding-agents", "Goose"],
  ["continuedev/continue", "coding-agents", "Continue"],
  ["SWE-agent/SWE-agent", "coding-agents", "SWE-agent"],
  ["google-gemini/gemini-cli", "coding-agents", "Gemini CLI"],
  ["QwenLM/qwen-code", "coding-agents", "Qwen Code"],
  ["Kilo-Org/kilocode", "coding-agents", "Kilo Code"],
  ["openinterpreter/openinterpreter", "coding-agents", "Open Interpreter"],
  ["esengine/DeepSeek-Reasonix", "coding-agents", "DeepSeek Reasonix"],
  // mcp-servers
  ["github/github-mcp-server", "mcp-servers", "GitHub MCP Server"],
  ["microsoft/playwright-mcp", "mcp-servers", "Playwright MCP"],
  ["upstash/context7", "mcp-servers", "Context7"],
  ["modelcontextprotocol/servers", "mcp-servers", "MCP Reference Servers"],
  ["ChromeDevTools/chrome-devtools-mcp", "mcp-servers", "Chrome DevTools MCP"],
  ["DeusData/codebase-memory-mcp", "mcp-servers", "Codebase Memory MCP"],
  ["oraios/serena", "mcp-servers", "Serena"],
  ["czlonkowski/n8n-mcp", "mcp-servers", "n8n-MCP"],
  // mcp-database-servers
  ["googleapis/mcp-toolbox", "mcp-database-servers", "MCP Toolbox for Databases"],
  ["bytebase/dbhub", "mcp-database-servers", "DBHub"],
  ["mongodb-js/mongodb-mcp-server", "mcp-database-servers", "MongoDB MCP Server"],
  ["designcomputer/mysql_mcp_server", "mcp-database-servers", "MySQL MCP Server"],
  ["Azure/data-api-builder", "mcp-database-servers", "Data API Builder"],
  ["prest/prest", "mcp-database-servers", "pREST"],
  // multi-agent-frameworks
  ["crewAIInc/crewAI", "multi-agent-frameworks", "CrewAI"],
  ["microsoft/autogen", "multi-agent-frameworks", "AutoGen"],
  ["langchain-ai/langgraph", "multi-agent-frameworks", "LangGraph"],
  ["aden-hive/hive", "multi-agent-frameworks", "Hive"],
  ["2FastLabs/agent-squad", "multi-agent-frameworks", "Agent Squad"],
  ["open-multi-agent/open-multi-agent", "multi-agent-frameworks", "Open Multi-Agent"],
  ["agentscope-ai/agentscope-java", "multi-agent-frameworks", "AgentScope Java"],
  // agent-frameworks
  ["pydantic/pydantic-ai", "agent-frameworks", "Pydantic AI"],
  ["deepset-ai/haystack", "agent-frameworks", "Haystack"],
  ["VoltAgent/voltagent", "agent-frameworks", "VoltAgent"],
  ["microsoft/agent-framework", "agent-frameworks", "Microsoft Agent Framework"],
  // research-agents
  ["bytedance/deer-flow", "research-agents", "DeerFlow"],
  ["assafelovic/gpt-researcher", "research-agents", "GPT Researcher"],
  ["zilliztech/deep-searcher", "research-agents", "DeepSearcher"],
  ["jordan-gibbs/hyperresearch", "research-agents", "HyperResearch"],
  ["NVIDIA-AI-Blueprints/deep-researcher-agent", "research-agents", "NVIDIA Deep Researcher Agent"],
  // browser-agents
  ["browser-use/browser-use", "browser-agents", "Browser Use"],
  ["bytedance/UI-TARS-desktop", "browser-agents", "UI-TARS Desktop"],
  ["trycua/cua", "browser-agents", "Cua"],
  ["nanobrowser/nanobrowser", "browser-agents", "Nanobrowser"],
  ["simular-ai/Agent-S", "browser-agents", "Agent S"],
  ["browser-use/web-ui", "browser-agents", "Browser Use Web UI"],
  // ops-agents
  ["Tracer-Cloud/opensre", "ops-agents", "OpenSRE"],
  ["HolmesGPT/holmesgpt", "ops-agents", "HolmesGPT"],
  ["ongridio/ongrid", "ops-agents", "OnGrid"],
  ["VersusControl/versus-incident", "ops-agents", "Versus Incident"],
  // personal-agents
  ["HKUDS/nanobot", "personal-agents", "nanobot"],
  ["leon-ai/leon", "personal-agents", "Leon"],
  ["gptme/gptme", "personal-agents", "gptme"],
  ["shiwenwen/hope-agent", "personal-agents", "Hope Agent"],
  ["ShenSeanChen/waku-agent", "personal-agents", "Waku Agent"],

  // --- Primera oleada (2026-10-18): curada a mano desde scripts/discover-agents.mjs ---
  ["herdrdev/herdr", "coding-agents", "Herdr"],
  ["codewhale-hq/Codewhale", "coding-agents", "Codewhale"],
  ["1jehuang/jcode", "coding-agents", "jcode"],
  ["superset-sh/superset", "coding-agents", "Superset"],
  ["vstorm-co/pydantic-deepagents", "coding-agents", "Pydantic DeepAgents"],
  ["tirth8205/code-review-graph", "mcp-servers", "Code Review Graph"],
  ["mksglu/context-mode", "mcp-servers", "Context Mode"],
  ["PrefectHQ/fastmcp", "mcp-servers", "FastMCP"],
  ["modelcontextprotocol/python-sdk", "mcp-servers", "MCP Python SDK"],
  ["ahujasid/blender-mcp", "mcp-servers", "Blender MCP"],
  ["dosco/graphjin", "mcp-database-servers", "GraphJin"],
  ["Kaelio/ktx", "mcp-database-servers", "ktx"],
  ["Canner/WrenAI", "mcp-database-servers", "Wren AI"],
  ["TencentCloudBase/CloudBase-AI-Toolkit", "mcp-database-servers", "CloudBase AI Toolkit"],
  ["ruvnet/ruflo", "multi-agent-frameworks", "Ruflo"],
  ["omnigent-ai/omnigent", "multi-agent-frameworks", "Omnigent"],
  ["strands-agents/harness-sdk", "multi-agent-frameworks", "Strands Agents Harness SDK"],
  ["crestalnetwork/intentkit", "multi-agent-frameworks", "IntentKit"],
  ["microsoft/agent-governance-toolkit", "agent-frameworks", "Agent Governance Toolkit"],
  ["1Panel-dev/MaxKB", "agent-frameworks", "MaxKB"],
  ["neuml/txtai", "agent-frameworks", "txtai"],
  ["n8n-io/n8n", "agent-frameworks", "n8n"],
  ["activepieces/activepieces", "agent-frameworks", "Activepieces"],
  ["modelscope/ms-agent", "agent-frameworks", "MS-Agent"],
  ["heurist-network/heurist-agent-framework", "agent-frameworks", "Heurist Agent Framework"],
  ["vamplabAI/sgr-agent-core", "agent-frameworks", "SGR Agent Core"],
  ["mvanhorn/last30days-skill", "research-agents", "last30days"],
  ["LearningCircuit/local-deep-research", "research-agents", "Local Deep Research"],
  ["ruc-datalab/DeepAnalyze", "research-agents", "DeepAnalyze"],
  ["AnotiaWang/deep-research-web-ui", "research-agents", "Deep Research Web UI"],
  ["zamalali/DeepGit", "research-agents", "DeepGit"],
  ["arc53/DocsGPT", "research-agents", "DocsGPT"],
  ["jackwener/OpenCLI", "browser-agents", "OpenCLI"],
  ["h4ckf0r0day/obscura", "browser-agents", "Obscura"],
  ["lexmount/moli", "browser-agents", "Moli"],
  ["citrolabs/ego-lite", "browser-agents", "Ego Lite"],
  ["web-infra-dev/midscene", "browser-agents", "Midscene"],
  ["steel-dev/steel-browser", "browser-agents", "Steel Browser"],
  ["CopilotKit/OpenBot", "browser-agents", "OpenBot"],
  ["TurixAI/TuriX-CUA", "browser-agents", "TuriX CUA"],
  ["qinshihu/itops-agent-platform", "ops-agents", "ITOps Agent Platform"],
  ["William-Lu-stack/Flawless", "ops-agents", "Flawless"],
  ["khoj-ai/khoj", "personal-agents", "Khoj"],
  ["Mintplex-Labs/anything-llm", "personal-agents", "AnythingLLM"],
  ["eigent-ai/eigent", "personal-agents", "Eigent"],
  ["johnbean393/Sidekick", "personal-agents", "Sidekick"],
  ["AtomicBot-ai/atomic-agent", "personal-agents", "Atomic Agent"],
  ["opencrabs/opencrabs", "personal-agents", "OpenCrabs"],
  ["skalesapp/skales", "personal-agents", "Skales"],
  ["RedPlanetHQ/core", "personal-agents", "CORE"],
  ["rociiu/talorys", "personal-agents", "Talorys"],

  // --- Segunda oleada (2026-10-18) ---
  ["charmbracelet/crush", "coding-agents", "Crush"],
  ["HKUDS/DeepCode", "coding-agents", "DeepCode"],
  ["Kuberwastaken/claurst", "coding-agents", "Claurst"],
  ["tailcallhq/forgecode", "coding-agents", "Forge"],
  ["anus-dev/ANUS", "coding-agents", "ANUS"],
  ["olimorris/codecompanion.nvim", "coding-agents", "CodeCompanion"],
  ["SWE-agent/mini-swe-agent", "coding-agents", "mini-SWE-agent"],
  ["smtg-ai/claude-squad", "coding-agents", "Claude Squad"],
  ["OrchestratorInc/agent-orchestrator", "coding-agents", "Agent Orchestrator"],
  ["wonderwhy-er/DesktopCommanderMCP", "mcp-servers", "Desktop Commander MCP"],
  ["awslabs/mcp", "mcp-servers", "AWS MCP Servers"],
  ["firecrawl/firecrawl-mcp-server", "mcp-servers", "Firecrawl MCP Server"],
  ["apify/apify-mcp-server", "mcp-servers", "Apify MCP Server"],
  ["modelcontextprotocol/typescript-sdk", "mcp-servers", "MCP TypeScript SDK"],
  ["mcp-use/mcp-use", "mcp-servers", "mcp-use"],
  ["mrexodia/ida-pro-mcp", "mcp-servers", "IDA Pro MCP"],
  ["CoplayDev/unity-mcp", "mcp-servers", "Unity MCP"],
  ["AgentDeskAI/browser-tools-mcp", "mcp-servers", "Browser Tools MCP"],
  ["grab/cursor-talk-to-figma-mcp", "mcp-servers", "Talk to Figma MCP"],
  ["getsentry/MobileBuildMCP", "mcp-servers", "Mobile Build MCP"],
  ["kyegomez/swarms", "multi-agent-frameworks", "Swarms"],
  ["MervinPraison/PraisonAI", "multi-agent-frameworks", "PraisonAI"],
  ["agentscope-ai/agentscope", "multi-agent-frameworks", "AgentScope"],
  ["paperclipai/paperclip", "multi-agent-frameworks", "Paperclip"],
  ["google/adk-python", "agent-frameworks", "Agent Development Kit (Python)"],
  ["letta-ai/letta", "agent-frameworks", "Letta"],
  ["alibaba/spring-ai-alibaba", "agent-frameworks", "Spring AI Alibaba"],
  ["The-Pocket/PocketFlow", "agent-frameworks", "Pocket Flow"],
  ["microsoft/agent-lightning", "agent-frameworks", "Agent Lightning"],
  ["Significant-Gravitas/AutoGPT", "agent-frameworks", "AutoGPT"],
  ["langgenius/dify", "agent-frameworks", "Dify"],
  ["ComposioHQ/composio", "agent-frameworks", "Composio"],
  ["CopilotKit/CopilotKit", "agent-frameworks", "CopilotKit"],
  ["triggerdotdev/trigger.dev", "agent-frameworks", "Trigger.dev"],
  ["iflytek/astron-agent", "agent-frameworks", "Astron Agent"],
  ["zhayujie/CowAgent", "personal-agents", "CowAgent"],
  ["Fosowl/agenticSeek", "personal-agents", "agenticSeek"],
  ["TencentCloud/Octop", "personal-agents", "Octop"],
  ["osaurus-ai/osaurus", "personal-agents", "Osaurus"],
  ["ThinkInAIXYZ/deepchat", "personal-agents", "DeepChat"],
  ["holaboss-ai/holaOS", "personal-agents", "holaOS"],
  ["EKKOLearnAI/ekko-studio", "personal-agents", "Ekko Studio"],
  ["lsdefine/GenericAgent", "personal-agents", "GenericAgent"],
  ["ValueCell-ai/ClawX", "personal-agents", "ClawX"],
  // --- Tercera oleada (2026-10-20): servidores MCP con ficha verificada ---
  ["supabase-community/supabase-mcp", "mcp-servers", "Supabase MCP"],
  ["makenotion/notion-mcp-server", "mcp-servers", "Notion MCP Server"],
  ["hashicorp/terraform-mcp-server", "mcp-servers", "Terraform MCP Server"],
  ["brightdata/brightdata-mcp", "mcp-servers", "Bright Data MCP"],
  ["exa-labs/exa-mcp-server", "mcp-servers", "Exa MCP Server"],
  ["tavily-ai/tavily-mcp", "mcp-servers", "Tavily MCP"],
  ["GLips/Figma-Context-MCP", "mcp-servers", "Framelink MCP for Figma"],
  ["grafana/mcp-grafana", "mcp-servers", "Grafana MCP Server"],
  ["taylorwilsdon/google_workspace_mcp", "mcp-servers", "Google Workspace MCP"],
  ["perplexityai/modelcontextprotocol", "mcp-servers", "Perplexity MCP Server"],
  ["redis/mcp-redis", "mcp-database-servers", "Redis MCP Server"],
  ["qdrant/mcp-server-qdrant", "mcp-database-servers", "Qdrant MCP Server"],
  ["neondatabase/mcp-server-neon", "mcp-database-servers", "Neon MCP Server"],
  ["motherduckdb/mcp-server-motherduck", "mcp-database-servers", "MotherDuck MCP Server"],
];

const headers = { Accept: "application/vnd.github+json", "User-Agent": "agentshortlist-build" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const OSI_SPDX = new Set(["MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "GPL-3.0", "AGPL-3.0", "MPL-2.0", "ISC"]);
const CJK = /[぀-ヿ㐀-鿿가-힯]/;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

let cache = {};
try {
  cache = JSON.parse(await readFile("scripts/.cache/github-repos.json", "utf8"));
} catch {}

const agents = [];
const failed = [];
const excluded = [];
let live = 0;

for (const [repo, category, display] of SEED) {
  let r = cache[repo];
  if (!r || Date.now() - new Date(r.fetchedAt).getTime() > CACHE_TTL_MS) {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    live++;
    if (!res.ok) {
      failed.push({ repo, status: res.status });
      continue;
    }
    const x = await res.json();
    r = {
      full_name: x.full_name,
      name: x.name,
      description: x.description,
      homepage: x.homepage,
      html_url: x.html_url,
      license: x.license ? { spdx_id: x.license.spdx_id } : null,
      stargazers_count: x.stargazers_count,
      pushed_at: x.pushed_at,
      archived: x.archived,
      fetchedAt: new Date().toISOString(),
    };
    cache[repo] = r;
  }

  const ageDays = (new Date(r.fetchedAt).getTime() - new Date(r.pushed_at).getTime()) / 86400000;
  if (r.archived || ageDays > MAX_AGE_DAYS) {
    excluded.push({ name: display, repo, reason: r.archived ? "archived" : "inactive", daysSincePush: Math.round(ageDays) });
    continue;
  }
  if (!r.description || CJK.test(r.description)) {
    excluded.push({ name: display, repo, reason: "no English description", daysSincePush: Math.round(ageDays) });
    continue;
  }
  const spdx = r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : null;
  agents.push({
    name: display,
    slug: slugify(display),
    category,
    description: r.description,
    officialUrl: r.homepage || null,
    repoUrl: r.html_url,
    license: spdx,
    pricingModel: spdx && OSI_SPDX.has(spdx) ? "Open source (model/API usage billed separately by your provider)" : null,
    stars: r.stargazers_count ?? null,
    lastPush: r.pushed_at ?? null,
    archived: r.archived,
    sources: [`https://api.github.com/repos/${repo}`, r.html_url],
    verifiedAt: r.fetchedAt,
  });
}

const slugs = agents.map((a) => a.slug);
const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dup.length) {
  console.error("DUPLICATE SLUGS:", dup);
  process.exit(1);
}

await mkdir("scripts/.cache", { recursive: true });
await writeFile("scripts/.cache/github-repos.json", JSON.stringify(cache, null, 2) + "\n");
await mkdir("src/data", { recursive: true });
await writeFile("src/data/agents.json", JSON.stringify(agents, null, 2) + "\n");
await writeFile("src/data/excluded.json", JSON.stringify(excluded, null, 2) + "\n");

const perCat = {};
for (const a of agents) perCat[a.category] = (perCat[a.category] ?? 0) + 1;
console.log(`OK: ${agents.length} agents written (live API calls: ${live})`, JSON.stringify(perCat));
if (excluded.length) console.log("EXCLUDED:", JSON.stringify(excluded));
if (failed.length) {
  console.error("FAILED (no data written for these):", JSON.stringify(failed));
  process.exit(2);
}
