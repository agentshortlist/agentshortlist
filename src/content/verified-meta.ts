// Datos estructurados de cada ficha para el comparador, el selector y el comprobador de configuración.
// Todo sale de lo ya escrito en verified.ts; "unknown" significa que no lo hemos comprobado.

export type Kind = "database" | "browser" | "code" | "web" | "docs" | "cloud" | "creative" | "automation" | "system" | "platform" | "reverse" | "reference";

export const KIND_LABEL: Record<Kind, string> = {
  database: "Databases",
  browser: "Browser and debugging",
  code: "Coding and code search",
  web: "Web data and scraping",
  docs: "Documentation",
  cloud: "Cloud",
  creative: "Design, 3D and games",
  automation: "Workflow automation",
  system: "Your computer",
  platform: "Developer platforms",
  reverse: "Reverse engineering",
  reference: "Reference implementations",
};

export type Facts = {
  kind: Kind;
  readOnly: "yes" | "no" | "unknown"; // el proyecto documenta un modo o receta de solo lectura
  telemetry: "default-on" | "claimed-off" | "unknown"; // datos enviados por defecto
  hosting: "local" | "hosted" | "both" | "unknown";
};

// Si ninguno de los textos de `ok` aparece en la configuración del servidor, se muestra el aviso.
// `ok` vacío: el aviso se muestra siempre que el servidor aparezca.
export type Check = { ok: string[]; message: string };

export type Meta = { match: string[]; facts: Facts; checks?: Check[] };

export const META: Record<string, Meta> = {
  "github-mcp-server": {
    match: ["github-mcp-server"],
    facts: { kind: "platform", readOnly: "yes", telemetry: "unknown", hosting: "both" },
    checks: [{ ok: ["GITHUB_READ_ONLY", "--read-only"], message: "No read-only flag found. With your token it can change repositories, issues and pull requests. The project documents a read-only mode (GITHUB_READ_ONLY=1)." }],
  },
  "playwright-mcp": {
    match: ["@playwright/mcp"],
    facts: { kind: "browser", readOnly: "no", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: ["--isolated"], message: "The browser profile is persistent by default, so logged-in sessions stay on disk. --isolated keeps the profile in memory." }],
  },
  "desktop-commander-mcp": {
    match: ["desktop-commander", "desktopcommander"],
    facts: { kind: "system", readOnly: "no", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: ["docker"], message: "Not running in Docker. The project says its restrictions are guardrails, not a sandbox, and recommends Docker or a VM for real isolation." }],
  },
  "mysql-mcp-server": {
    match: ["mysql_mcp_server", "mysql-mcp-server"],
    facts: { kind: "database", readOnly: "no", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: [], message: "This server has no read-only mode: execute_sql accepts INSERT, UPDATE and DELETE. Check that the database user can only SELECT." }],
  },
  context7: { match: ["context7"], facts: { kind: "docs", readOnly: "unknown", telemetry: "unknown", hosting: "hosted" } },
  "chrome-devtools-mcp": {
    match: ["chrome-devtools-mcp"],
    facts: { kind: "browser", readOnly: "no", telemetry: "default-on", hosting: "local" },
    checks: [
      { ok: ["--no-usage-statistics"], message: "Usage statistics are sent to Google by default. --no-usage-statistics turns that off." },
      { ok: ["--no-performance-crux"], message: "Performance tools may send trace URLs to the Google CrUX API. --no-performance-crux turns that off." },
    ],
  },
  "mcp-reference-servers": {
    match: ["@modelcontextprotocol/server-", "mcp-server-git", "mcp-server-fetch", "mcp-server-time"],
    facts: { kind: "reference", readOnly: "unknown", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: [], message: "These are reference implementations. The project says they are not production-ready and that you must evaluate your own security needs." }],
  },
  serena: { match: ["serena"], facts: { kind: "code", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  "n8n-mcp": {
    match: ["n8n-mcp"],
    facts: { kind: "automation", readOnly: "yes", telemetry: "unknown", hosting: "both" },
    checks: [{ ok: ["DISABLED_TOOLS"], message: "No tools are disabled, so workflow and credential tools are available. The project has a read-only recipe based on DISABLED_TOOLS." }],
  },
  "mcp-toolbox-for-databases": { match: ["genai-toolbox", "mcp-toolbox"], facts: { kind: "database", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  "firecrawl-mcp-server": { match: ["firecrawl-mcp"], facts: { kind: "web", readOnly: "unknown", telemetry: "unknown", hosting: "both" } },
  "mongodb-mcp-server": {
    match: ["mongodb-mcp-server"],
    facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: ["--readOnly", "MDB_MCP_READ_ONLY"], message: "No read-only flag found, so it can change data. --readOnly (or MDB_MCP_READ_ONLY=true) is documented." }],
  },
  dbhub: {
    match: ["dbhub"],
    facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: ["readonly"], message: "Read-only mode is set in dbhub.toml (readonly = true on the execute_sql tool), not in this client configuration. Check that file." }],
  },
  "browser-tools-mcp": { match: ["browser-tools-mcp"], facts: { kind: "browser", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  "aws-mcp-servers": { match: ["awslabs."], facts: { kind: "cloud", readOnly: "unknown", telemetry: "unknown", hosting: "both" } },
  "apify-mcp-server": {
    match: ["actors-mcp-server", "mcp.apify.com"],
    facts: { kind: "web", readOnly: "unknown", telemetry: "default-on", hosting: "both" },
    checks: [{ ok: ["telemetry-enabled=false", "TELEMETRY_ENABLED"], message: "Telemetry about tool calls is on by default. --telemetry-enabled=false (or TELEMETRY_ENABLED=false) turns it off." }],
  },
  "blender-mcp": {
    match: ["mcp-for-blender", "blender-mcp"],
    facts: { kind: "creative", readOnly: "no", telemetry: "default-on", hosting: "local" },
    checks: [
      { ok: ["BLENDER_MCP_SAFE_MODE"], message: "Safe mode is off, so the AI can run any Python code in Blender. BLENDER_MCP_SAFE_MODE=1 blocks risky scripts." },
      { ok: ["DISABLE_TELEMETRY"], message: "A minimal anonymous usage record is sent by default. DISABLE_TELEMETRY=true turns it off." },
    ],
  },
  "unity-mcp": { match: ["mcpforunity", "unity-mcp"], facts: { kind: "creative", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  "ida-pro-mcp": { match: ["ida-pro-mcp"], facts: { kind: "reverse", readOnly: "no", telemetry: "unknown", hosting: "local" } },
  "talk-to-figma-mcp": { match: ["talk-to-figma", "talk_to_figma"], facts: { kind: "creative", readOnly: "no", telemetry: "unknown", hosting: "local" } },
  "codebase-memory-mcp": { match: ["codebase-memory-mcp"], facts: { kind: "code", readOnly: "unknown", telemetry: "claimed-off", hosting: "local" } },
  "context-mode": { match: ["context-mode"], facts: { kind: "code", readOnly: "unknown", telemetry: "claimed-off", hosting: "local" } },
  "data-api-builder": { match: ["data-api-builder", "microsoft.dataapibuilder"], facts: { kind: "database", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  graphjin: { match: ["graphjin"], facts: { kind: "database", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  prest: { match: ["prest/prest", "prestd"], facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "local" } },
  "supabase-mcp": {
    match: ["mcp.supabase.com", "mcp-server-supabase"],
    facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "both" },
    checks: [{ ok: ["read_only=true", "--read-only"], message: "No read-only setting found. By default the server can change tables and data in your project. The project documents read_only=true and project_ref on the MCP URL." }],
  },
  "notion-mcp-server": {
    match: ["notion-mcp-server"],
    facts: { kind: "platform", readOnly: "yes", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: [], message: "This repository is no longer actively maintained, according to its README. Notion recommends its hosted Remote Notion MCP instead." }],
  },
  "terraform-mcp-server": { match: ["terraform-mcp-server"], facts: { kind: "cloud", readOnly: "no", telemetry: "claimed-off", hosting: "local" } },
  "bright-data-mcp": {
    match: ["@brightdata/mcp", "mcp.brightdata.com"],
    facts: { kind: "web", readOnly: "unknown", telemetry: "unknown", hosting: "both" },
    checks: [{ ok: ["groups=", "tools="], message: "No tool limit found, so all 32 tools are available, including remote browser control. On the hosted server, groups= and tools= on the URL limit them." }],
  },
  "exa-mcp-server": { match: ["exa-mcp-server", "mcp.exa.ai"], facts: { kind: "web", readOnly: "unknown", telemetry: "unknown", hosting: "hosted" } },
  "tavily-mcp": { match: ["tavily-mcp", "mcp.tavily.com"], facts: { kind: "web", readOnly: "unknown", telemetry: "unknown", hosting: "both" } },
  "framelink-mcp-for-figma": { match: ["figma-developer-mcp"], facts: { kind: "creative", readOnly: "unknown", telemetry: "unknown", hosting: "local" } },
  "grafana-mcp-server": {
    match: ["mcp-grafana"],
    facts: { kind: "platform", readOnly: "yes", telemetry: "unknown", hosting: "both" },
    checks: [{ ok: ["--disable-write"], message: "Write tools are enabled, so the AI can create and update things in Grafana. --disable-write removes them." }],
  },
  "google-workspace-mcp": {
    match: ["workspace-mcp"],
    facts: { kind: "platform", readOnly: "yes", telemetry: "claimed-off", hosting: "local" },
    checks: [{ ok: ["--read-only"], message: "No --read-only flag found, so the server can send mail and change files. The project documents --read-only, plus --tool-tier and --tools to expose less." }],
  },
  "perplexity-mcp-server": { match: ["@perplexity-ai/mcp-server", "api.perplexity.ai/mcp"], facts: { kind: "web", readOnly: "unknown", telemetry: "unknown", hosting: "both" } },
  "redis-mcp-server": {
    match: ["redis-mcp-server", "mcp-redis"],
    facts: { kind: "database", readOnly: "no", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: [], message: "This server has no read-only mode: its tools can set values, remove items and publish messages. Connect with a Redis ACL user limited to read commands (the README shows +@read -@write)." }],
  },
  "qdrant-mcp-server": {
    match: ["mcp-server-qdrant"],
    facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "local" },
    checks: [{ ok: ["QDRANT_READ_ONLY"], message: "Read-only mode is off, so the AI can store data in your collection. QDRANT_READ_ONLY=true disables qdrant-store." }],
  },
  "neon-mcp-server": {
    match: ["mcp.neon.tech", "mcp-server-neon"],
    facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "hosted" },
    checks: [{ ok: ["readonly"], message: "No readonly setting found, so the AI can create branches and run migrations. Neon documents readonly=true, projectId and roleName on the MCP URL, and says not to use this server in production." }],
  },
  "motherduck-mcp-server": { match: ["mcp-server-motherduck"], facts: { kind: "database", readOnly: "yes", telemetry: "unknown", hosting: "local" } },
};

// Ajustes que pide cada servidor: solo NOMBRES, nunca valores. "required" = el proyecto dice que hace falta para funcionar.
// Solo se listan los comprobados en su README o en su código; sin entrada, la ficha no muestra la sección.
export type Setting = { name: string; kind: "env" | "flag"; required: boolean; note: string; url: string };

const R = (repo: string, path = "#readme") => `https://github.com/${repo}${path}`;

export const SETTINGS: Record<string, Setting[]> = {
  "github-mcp-server": [
    { name: "GITHUB_PERSONAL_ACCESS_TOKEN", kind: "env", required: true, note: "Your GitHub token for the local server. The remote server can use OAuth instead.", url: R("github/github-mcp-server") },
    { name: "GITHUB_READ_ONLY", kind: "env", required: false, note: "Set to 1 to offer only read tools.", url: R("github/github-mcp-server", "#read-only-mode") },
    { name: "GITHUB_TOOLSETS", kind: "env", required: false, note: "Comma-separated toolsets to enable, to expose fewer tools.", url: R("github/github-mcp-server") },
  ],
  "mysql-mcp-server": [
    { name: "MYSQL_USER", kind: "env", required: true, note: "Database user. The server stops without it.", url: R("designcomputer/mysql_mcp_server", "/blob/main/src/mysql_mcp_server/server.py") },
    { name: "MYSQL_PASSWORD", kind: "env", required: true, note: "Database password. May be an empty string, but must be set.", url: R("designcomputer/mysql_mcp_server", "/blob/main/src/mysql_mcp_server/server.py") },
    { name: "MYSQL_DATABASE", kind: "env", required: false, note: "Default database.", url: R("designcomputer/mysql_mcp_server", "/blob/main/src/mysql_mcp_server/server.py") },
    { name: "MYSQL_HOST / MYSQL_PORT", kind: "env", required: false, note: "Server address; defaults to localhost and 3306.", url: R("designcomputer/mysql_mcp_server", "/blob/main/src/mysql_mcp_server/server.py") },
    { name: "MYSQL_SSH_ENABLE and MYSQL_SSH_*", kind: "env", required: false, note: "Optional SSH tunnel, including a path to a key file.", url: R("designcomputer/mysql_mcp_server", "/blob/main/src/mysql_mcp_server/server.py") },
  ],
  context7: [
    { name: "CONTEXT7_API_KEY", kind: "env", required: false, note: "Recommended for higher rate limits. OAuth is also supported.", url: R("upstash/context7") },
  ],
  "n8n-mcp": [
    { name: "N8N_API_URL", kind: "env", required: true, note: "Address of your n8n instance, needed by the workflow management tools.", url: R("czlonkowski/n8n-mcp") },
    { name: "N8N_API_KEY", kind: "env", required: true, note: "n8n API key for the management tools. The README suggests a read-only key for defence in depth.", url: R("czlonkowski/n8n-mcp") },
    { name: "N8N_MCP_ACCESS_TOKEN", kind: "env", required: false, note: "Separate secret for n8n's instance-level MCP features.", url: R("czlonkowski/n8n-mcp") },
    { name: "DISABLED_TOOLS", kind: "env", required: false, note: "Comma-separated tools to switch off, for example the write and credential tools.", url: R("czlonkowski/n8n-mcp", "#read-only-deployment") },
    { name: "DISABLED_TOOL_OPERATIONS", kind: "env", required: false, note: "Switch off only some operations of a tool, such as delete.", url: R("czlonkowski/n8n-mcp", "#read-only-deployment") },
  ],
  "firecrawl-mcp-server": [
    { name: "FIRECRAWL_API_KEY", kind: "env", required: true, note: "Needed for the cloud API. Optional with a self-hosted instance. A keyless free tier covers scrape, search and parse.", url: R("firecrawl/firecrawl-mcp-server") },
    { name: "FIRECRAWL_API_URL", kind: "env", required: false, note: "Address of a self-hosted instance.", url: R("firecrawl/firecrawl-mcp-server") },
    { name: "FIRECRAWL_OAUTH_TOKEN", kind: "env", required: false, note: "Static OAuth access token for stdio, as an alternative to the API key.", url: R("firecrawl/firecrawl-mcp-server") },
    { name: "FIRECRAWL_NO_SEARCH_FEEDBACK / FIRECRAWL_NO_ENDPOINT_FEEDBACK", kind: "env", required: false, note: "Set to 1 to remove the feedback tools.", url: R("firecrawl/firecrawl-mcp-server") },
  ],
  "mongodb-mcp-server": [
    { name: "MDB_MCP_CONNECTION_STRING", kind: "env", required: false, note: "MongoDB connection string. You can give this or Atlas API credentials.", url: R("mongodb-js/mongodb-mcp-server") },
    { name: "MDB_MCP_API_CLIENT_ID / MDB_MCP_API_CLIENT_SECRET", kind: "env", required: false, note: "Atlas service-account credentials, needed for the Atlas tools. Assign them minimum permissions.", url: R("mongodb-js/mongodb-mcp-server") },
    { name: "MDB_MCP_READ_ONLY", kind: "env", required: false, note: "Set to true for read-only access. Same as the --readOnly flag.", url: R("mongodb-js/mongodb-mcp-server") },
  ],
  dbhub: [
    { name: "--dsn", kind: "flag", required: true, note: "Database connection string, as in the README's example. Read-only mode is set in dbhub.toml, not here.", url: R("bytebase/dbhub") },
  ],
  "apify-mcp-server": [
    { name: "APIFY_TOKEN", kind: "env", required: true, note: "Your Apify API token for the local server. The hosted endpoint can use OAuth instead.", url: R("apify/apify-mcp-server") },
    { name: "TELEMETRY_ENABLED", kind: "env", required: false, note: "Set to false to turn telemetry off. Same as --telemetry-enabled=false.", url: R("apify/apify-mcp-server", "#-telemetry") },
  ],
  "blender-mcp": [
    { name: "BLENDER_HOST / BLENDER_PORT", kind: "env", required: false, note: "Where the Blender add-on listens; defaults to localhost.", url: R("ahujasid/mcp-for-blender", "#readme") },
    { name: "BLENDER_MCP_SAFE_MODE", kind: "env", required: false, note: "Set to 1 to check scripts before they run and block risky code.", url: R("ahujasid/mcp-for-blender", "#safe-mode") },
    { name: "DISABLE_TELEMETRY", kind: "env", required: false, note: "Set to true to turn off the minimal anonymous usage record.", url: R("ahujasid/mcp-for-blender", "#telemetry-control") },
  ],
  "chrome-devtools-mcp": [
    { name: "--no-usage-statistics", kind: "flag", required: false, note: "Opt out of usage statistics sent to Google.", url: R("ChromeDevTools/chrome-devtools-mcp") },
    { name: "--no-performance-crux", kind: "flag", required: false, note: "Stop performance tools sending trace URLs to the CrUX API.", url: R("ChromeDevTools/chrome-devtools-mcp") },
    { name: "--slim", kind: "flag", required: false, note: "Basic browser tasks only, with fewer tools.", url: R("ChromeDevTools/chrome-devtools-mcp") },
  ],
  "playwright-mcp": [
    { name: "--isolated", kind: "flag", required: false, note: "Keep the browser profile in memory instead of on disk.", url: R("microsoft/playwright-mcp", "#user-profile") },
    { name: "--allowed-origins / --blocked-origins", kind: "flag", required: false, note: "Origins the browser may or may not request. The README says this is not a security boundary.", url: R("microsoft/playwright-mcp", "#configuration") },
    { name: "--allow-unrestricted-file-access", kind: "flag", required: false, note: "Lifts the workspace limit on files and allows file:// URLs.", url: R("microsoft/playwright-mcp", "#configuration") },
  ],
  "supabase-mcp": [
    { name: "read_only=true", kind: "flag", required: false, note: "URL parameter. The server omits the tools that modify data.", url: R("supabase/mcp") },
    { name: "project_ref", kind: "flag", required: false, note: "URL parameter. Limits the server to one project and drops account-level tools.", url: R("supabase/mcp") },
    { name: "features", kind: "flag", required: false, note: "URL parameter. Restricts the groups of tools, for example database and docs.", url: R("supabase/mcp") },
  ],
  "notion-mcp-server": [
    { name: "NOTION_TOKEN", kind: "env", required: true, note: "Your Notion integration token. A read-only integration limits what the server can change.", url: R("makenotion/notion-mcp-server") },
    { name: "AUTH_TOKEN", kind: "env", required: false, note: "Bearer token for the Streamable HTTP transport.", url: R("makenotion/notion-mcp-server") },
  ],
  "terraform-mcp-server": [
    { name: "TFE_TOKEN", kind: "env", required: false, note: "API token for HCP Terraform or Terraform Enterprise tools.", url: R("hashicorp/terraform-mcp-server") },
    { name: "TFE_ADDRESS", kind: "env", required: false, note: "Address of HCP Terraform or Terraform Enterprise, with the protocol.", url: R("hashicorp/terraform-mcp-server") },
    { name: "ENABLE_TF_OPERATIONS", kind: "env", required: false, note: "Set to true to enable the tools that require explicit approval. Off by default.", url: R("hashicorp/terraform-mcp-server") },
    { name: "OTEL_METRICS_ENABLED", kind: "env", required: false, note: "Set to true to export OpenTelemetry metrics of tool use. Off by default.", url: R("hashicorp/terraform-mcp-server") },
  ],
  "bright-data-mcp": [
    { name: "API_TOKEN", kind: "env", required: true, note: "Your Bright Data API token for the local server. The hosted server takes it as a token= URL parameter.", url: R("brightdata/brightdata-mcp") },
    { name: "groups / tools", kind: "flag", required: false, note: "Hosted-server URL parameters that limit which tools are offered.", url: R("brightdata/brightdata-mcp") },
  ],
  "tavily-mcp": [
    { name: "TAVILY_API_KEY", kind: "env", required: true, note: "Your Tavily API key for the local server.", url: R("tavily-ai/tavily-mcp") },
    { name: "TAVILY_HUMAN_ID", kind: "env", required: false, note: "Optional end-user identifier, sent as an X-Human-Id header. Tavily hashes it before storage.", url: R("tavily-ai/tavily-mcp") },
  ],
  "framelink-mcp-for-figma": [
    { name: "FIGMA_API_KEY", kind: "env", required: true, note: "Your Figma personal access token. It can also be passed as --figma-api-key.", url: R("GLips/Figma-Context-MCP") },
  ],
  "grafana-mcp-server": [
    { name: "GRAFANA_URL", kind: "env", required: true, note: "Address of your Grafana instance.", url: R("grafana/mcp-grafana") },
    { name: "GRAFANA_SERVICE_ACCOUNT_TOKEN", kind: "env", required: true, note: "Grafana service account token. Give it only the permissions the tools you use need.", url: R("grafana/mcp-grafana") },
    { name: "--disable-write", kind: "flag", required: false, note: "Removes the create and update tools.", url: R("grafana/mcp-grafana") },
    { name: "--enabled-tools", kind: "flag", required: false, note: "Comma-separated tool categories to enable; several are off by default.", url: R("grafana/mcp-grafana") },
  ],
  "google-workspace-mcp": [
    { name: "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET", kind: "env", required: true, note: "Your own Google OAuth client, from a Google Cloud project you control.", url: R("taylorwilsdon/google_workspace_mcp") },
    { name: "--read-only", kind: "flag", required: false, note: "Read-only mode.", url: R("taylorwilsdon/google_workspace_mcp") },
    { name: "--tool-tier", kind: "flag", required: false, note: "core, extended or complete: how many tools to expose.", url: R("taylorwilsdon/google_workspace_mcp") },
    { name: "--tools", kind: "flag", required: false, note: "The Google services to expose, for example gmail drive calendar.", url: R("taylorwilsdon/google_workspace_mcp") },
  ],
  "perplexity-mcp-server": [
    { name: "PERPLEXITY_API_KEY", kind: "env", required: true, note: "Your Perplexity API key for the local server.", url: R("perplexityai/modelcontextprotocol") },
  ],
  "redis-mcp-server": [
    { name: "--url", kind: "flag", required: false, note: "Redis connection URL (redis:// or rediss://). Host, port and password can be given separately.", url: R("redis/mcp-redis") },
    { name: "REDIS_PWD", kind: "env", required: false, note: "Redis password, in the README's environment-variable configuration.", url: R("redis/mcp-redis") },
  ],
  "qdrant-mcp-server": [
    { name: "QDRANT_URL", kind: "env", required: false, note: "Address of the Qdrant server. Use this or QDRANT_LOCAL_PATH.", url: R("qdrant/mcp-server-qdrant") },
    { name: "QDRANT_API_KEY", kind: "env", required: false, note: "API key for the Qdrant server.", url: R("qdrant/mcp-server-qdrant") },
    { name: "COLLECTION_NAME", kind: "env", required: false, note: "Default collection to use.", url: R("qdrant/mcp-server-qdrant") },
    { name: "QDRANT_READ_ONLY", kind: "env", required: false, note: "Set to true to disable the store tool.", url: R("qdrant/mcp-server-qdrant") },
  ],
  "neon-mcp-server": [
    { name: "readonly / projectId / category / roleName", kind: "flag", required: false, note: "Parameters on the MCP URL that fix the grant: read-only, one project, some tool categories, one Postgres role.", url: R("neondatabase/mcp-server-neon") },
  ],
  "motherduck-mcp-server": [
    { name: "--read-write", kind: "flag", required: false, note: "Allows writes. Without it, a DuckDB file is opened read-only.", url: R("motherduckdb/mcp-server-motherduck") },
    { name: "--allow-switch-databases", kind: "flag", required: false, note: "Lets the AI switch to any database, including S3 and MotherDuck, at runtime.", url: R("motherduckdb/mcp-server-motherduck") },
    { name: "motherduck_token", kind: "env", required: false, note: "MotherDuck token, for MotherDuck databases.", url: R("motherduckdb/mcp-server-motherduck") },
  ],
};
