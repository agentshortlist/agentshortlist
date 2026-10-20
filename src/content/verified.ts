// Fichas verificadas a mano. Cada dato lleva su origen, un enlace y la fecha de revisión de la ficha.
// Regla: si no se ha podido comprobar, el valor es "Not verified" con origen "unknown". Nada se rellena por suposición.
// Este fichero vive fuera de src/data a propósito: src/data se refresca en el servidor y no viaja en los zips de código.

export type Source = "official" | "github" | "registry" | "osv" | "own-view" | "unknown";

export const SOURCE_LABEL: Record<Source, string> = {
  official: "Official docs",
  github: "GitHub",
  registry: "Package registry",
  osv: "OSV.dev",
  "own-view": "Our recommendation",
  unknown: "Not verified",
};

export type Row = { label: string; value: string; source: Source; url?: string };

export type Hardening = {
  title: string;
  note: string;
  language: "bash" | "json" | "sql";
  code: string;
  source: Source;
  url?: string;
};

export type VerifiedCard = {
  slug: string;
  version: string; // versión revisada
  reviewedAt: string; // AAAA-MM-DD
  use: Row[]; // para qué sirve y para qué no
  context: Row[]; // herramientas y coste de contexto
  permissions: Row[]; // qué puede hacer
  maintenance: Row[];
  hardening: Hardening[];
  alternative?: { name: string; url: string; note: string; source: Source };
};

const D = "2026-10-18";
const D2 = "2026-10-19";
const D3 = "2026-10-20";
const STALE_REF = "2026-07-20"; // 90 días antes de la revisión

export const VERIFIED: VerifiedCard[] = [
  {
    slug: "github-mcp-server",
    version: "v2.0.2 (2026-10-08)",
    reviewedAt: D,
    use: [
      { label: "Made for", value: "Letting an AI client work with GitHub: repositories, issues, pull requests and other GitHub API areas.", source: "github", url: "https://github.com/github/github-mcp-server#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "About 96 tools listed in the README (counted by us), grouped into toolsets.", source: "github", url: "https://github.com/github/github-mcp-server#readme" },
      { label: "Ways to expose fewer tools", value: "Toolsets (--toolsets or GITHUB_TOOLSETS) and a read-only mode. The README says enabling only the toolsets you need reduces context size.", source: "github", url: "https://github.com/github/github-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A GitHub personal access token, or OAuth on the remote server. The README advises granting only the scopes you need.", source: "github", url: "https://github.com/github/github-mcp-server#readme" },
      { label: "Can change data", value: "Yes, in GitHub (repositories, issues, pull requests). Read-only mode offers only read tools.", source: "github", url: "https://github.com/github/github-mcp-server#read-only-mode" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.0.2, 2026-10-08", source: "github", url: "https://github.com/github/github-mcp-server/releases" },
      { label: "Last push", value: "2026-10-15", source: "github", url: "https://github.com/github/github-mcp-server" },
      { label: "Open issues", value: `380, of which 112 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/github/github-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "go.sum and ui/package-lock.json", source: "github", url: "https://github.com/github/github-mcp-server" },
    ],
    hardening: [
      {
        title: "Run it read-only",
        note: "From the project's README. Replace the placeholder with your own token. Read-only mode removes the tools that modify repositories, issues and pull requests.",
        language: "bash",
        code: "docker run -i --rm \\\n  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token> \\\n  -e GITHUB_READ_ONLY=1 \\\n  ghcr.io/github/github-mcp-server",
        source: "github",
        url: "https://github.com/github/github-mcp-server#read-only-mode",
      },
    ],
  },
  {
    slug: "playwright-mcp",
    version: "v0.0.83 (2026-09-28)",
    reviewedAt: D,
    use: [
      { label: "Made for", value: "Giving an AI client browser automation through Playwright.", source: "github", url: "https://github.com/microsoft/playwright-mcp#readme" },
      { label: "Not made for", value: "Coding agents that must keep context small: the README recommends Playwright CLI with Skills for them, because it avoids loading large tool schemas and verbose page snapshots.", source: "github", url: "https://github.com/microsoft/playwright-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "About 58 tools listed in the README (counted by us), plus optional groups enabled with --caps.", source: "github", url: "https://github.com/microsoft/playwright-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Files", value: "Restricted to the workspace roots by default. --allow-unrestricted-file-access lifts that and allows file:// URLs.", source: "github", url: "https://github.com/microsoft/playwright-mcp#configuration" },
      { label: "Network", value: "The browser can request any origin by default. --allowed-origins and --blocked-origins exist, but the README says they are not a security boundary.", source: "github", url: "https://github.com/microsoft/playwright-mcp#configuration" },
      { label: "Browser profile", value: "Persistent by default, so logged-in sessions are kept on disk. --isolated keeps the profile in memory.", source: "github", url: "https://github.com/microsoft/playwright-mcp#user-profile" },
      { label: "Sandbox", value: "On by default; --no-sandbox turns it off.", source: "github", url: "https://github.com/microsoft/playwright-mcp#configuration" },
      { label: "Credentials", value: "None required.", source: "github", url: "https://github.com/microsoft/playwright-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.0.83, 2026-09-28", source: "github", url: "https://github.com/microsoft/playwright-mcp/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/microsoft/playwright-mcp" },
      { label: "Open issues", value: `4, of which 0 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/microsoft/playwright-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/microsoft/playwright-mcp" },
    ],
    hardening: [
      {
        title: "Keep the browser profile in memory",
        note: "Based on the isolated-mode example in the project's README. --isolated keeps the profile in memory instead of saving logins to disk.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "playwright": {\n      "command": "npx",\n      "args": ["@playwright/mcp@latest", "--isolated"]\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/microsoft/playwright-mcp#isolated",
      },
    ],
    alternative: {
      name: "Playwright CLI with Skills",
      url: "https://github.com/microsoft/playwright-cli",
      note: "Recommended by the project's own README for coding agents, as more token-efficient.",
      source: "github",
    },
  },
  {
    slug: "desktop-commander-mcp",
    version: "v0.3.0 (2026-10-13)",
    reviewedAt: D,
    use: [
      { label: "Made for", value: "Letting an AI client edit files and run terminal commands, including long-running processes, on your machine.", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP#readme" },
      { label: "Not made for", value: "Containing an untrusted or compromised AI client. The project's security policy says its restrictions are guardrails, not a sandbox.", source: "official", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md" },
    ],
    context: [
      { label: "Tools", value: "24 distinct tool names in the server source (counted by us).", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/src/server.ts" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Files", value: "Reads and writes files with your user permissions.", source: "official", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md" },
      { label: "Shell commands", value: "Runs arbitrary terminal commands with your user permissions.", source: "official", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md" },
      { label: "Built-in limits", value: "Allowed directories, a command blocklist and symlink protection. The project says none of them is a security boundary.", source: "official", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md" },
      { label: "Real isolation", value: "Docker or a virtual machine, which the project documents.", source: "official", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/blob/main/SECURITY.md" },
      { label: "Local record of calls", value: "Keeps a local history of tool calls and arguments.", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP#readme" },
      { label: "Sends data to third parties", value: "Not verified. The README does not say.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.3.0, 2026-10-13", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/releases" },
      { label: "Last push", value: "2026-10-18", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP" },
      { label: "Open issues", value: `311, of which 126 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/wonderwhy-er/DesktopCommanderMCP" },
    ],
    hardening: [
      {
        title: "Run it in Docker with no file access",
        note: "The project's own 'basic setup (no file access)'. Mount only the folders you want to expose, as the README shows.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "desktop-commander-in-docker": {\n      "command": "docker",\n      "args": ["run", "-i", "--rm", "mcp/desktop-commander:latest"]\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/wonderwhy-er/DesktopCommanderMCP#readme",
      },
    ],
  },
  {
    slug: "mysql-mcp-server",
    version: "v0.4.4 (2026-07-30)",
    reviewedAt: D,
    use: [
      { label: "Made for", value: "Letting an AI client list tables, inspect schemas and run SQL against a MySQL database.", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server" },
      { label: "Not made for", value: "Read-only access: we found no read-only mode in the source.", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/blob/main/src/mysql_mcp_server/server.py" },
    ],
    context: [
      { label: "Tools", value: "3: execute_sql, get_schema_info, get_table_sample.", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/blob/main/src/mysql_mcp_server/server.py" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Yes. execute_sql accepts INSERT, UPDATE and DELETE, and autocommit is on.", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/blob/main/src/mysql_mcp_server/server.py" },
      { label: "Credentials", value: "MySQL user and password through environment variables. An SSH tunnel with a key path is optional.", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/blob/main/src/mysql_mcp_server/server.py" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.4.4, 2026-07-30", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/releases" },
      { label: "Last push", value: "2026-08-02 (77 days before review): low activity", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server" },
      { label: "Open issues", value: `6, of which 1 was opened before ${STALE_REF}`, source: "github", url: "https://github.com/designcomputer/mysql_mcp_server/issues" },
      { label: "Dependency lockfiles", value: "requirements.txt and uv.lock", source: "github", url: "https://github.com/designcomputer/mysql_mcp_server" },
    ],
    hardening: [
      {
        title: "Give it a database user that can only read",
        note: "Not from the project. Because the server has no read-only mode, the limit has to live in the database. Standard MySQL; adapt names and host to your setup.",
        language: "sql",
        code: "CREATE USER 'agent_ro'@'localhost' IDENTIFIED BY '<choose-a-password>';\nGRANT SELECT ON your_database.* TO 'agent_ro'@'localhost';",
        source: "own-view",
      },
    ],
  },
  {
    slug: "context7",
    version: "ctx7@0.8.0 (2026-10-16)",
    reviewedAt: D,
    use: [
      { label: "Made for", value: "Giving an AI client up-to-date, version-specific library documentation.", source: "github", url: "https://github.com/upstash/context7#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "2: resolve-library-id and query-docs.", source: "github", url: "https://github.com/upstash/context7#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "How it runs", value: "As a hosted service at mcp.context7.com. Your queries go to that service by design.", source: "github", url: "https://github.com/upstash/context7#readme" },
      { label: "Credentials", value: "An API key is recommended for higher rate limits; OAuth is supported.", source: "github", url: "https://github.com/upstash/context7#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Data handling policy", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "ctx7@0.8.0, 2026-10-16", source: "github", url: "https://github.com/upstash/context7/releases" },
      { label: "Last push", value: "2026-10-17", source: "github", url: "https://github.com/upstash/context7" },
      { label: "Open issues", value: `49, of which 9 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/upstash/context7/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/upstash/context7" },
    ],
    hardening: [],
    alternative: {
      name: "Context7 CLI with Skills",
      url: "https://github.com/upstash/context7#readme",
      note: "The README offers a CLI + Skills mode as well as MCP.",
      source: "github",
    },
  },

  // ---- Segunda tanda: revisión 2026-10-19 ----
  {
    slug: "chrome-devtools-mcp",
    version: "chrome-devtools-mcp-v1.11.0 (2026-10-15)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Letting an AI client inspect and debug a Chrome browser through DevTools.", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme" },
      { label: "Not made for", value: "Other browsers. Only Google Chrome and Chrome for Testing are officially supported; Chromium-based browsers may work but are not guaranteed.", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README points to a separate tool reference.", source: "unknown" },
      { label: "Ways to expose fewer tools", value: "A --slim mode for basic browser tasks.", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Browser content", value: "Exposes the content of the browser instance to the client, which can inspect, debug and modify any data in the browser or DevTools. The README advises not sharing sensitive information you don't want the client to see.", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme" },
      { label: "Sends data to third parties", value: "Yes, by default. Google collects usage statistics (opt out with --no-usage-statistics), and performance tools may send trace URLs to the Google CrUX API (opt out with --no-performance-crux).", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "chrome-devtools-mcp-v1.11.0, 2026-10-15", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp/releases" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp" },
      { label: "Open issues", value: `173, of which 46 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/ChromeDevTools/chrome-devtools-mcp" },
    ],
    hardening: [
      {
        title: "Turn off the data sent to Google",
        note: "Both flags are documented in the project's README. We combined them in one configuration.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "chrome-devtools": {\n      "command": "npx",\n      "args": ["-y", "chrome-devtools-mcp@latest", "--no-usage-statistics", "--no-performance-crux"]\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/ChromeDevTools/chrome-devtools-mcp#readme",
      },
    ],
  },
  {
    slug: "mcp-reference-servers",
    version: "v2.0.0 (2026-10-19)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Reference implementations that demonstrate MCP features and SDK usage, as educational examples for people building their own servers.", source: "github", url: "https://github.com/modelcontextprotocol/servers#readme" },
      { label: "Not made for", value: "Production use. The README says they are not production-ready solutions and that developers must evaluate their own security requirements.", source: "github", url: "https://github.com/modelcontextprotocol/servers#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The repository holds several servers, each with its own tools.", source: "unknown" },
    ],
    permissions: [
      { label: "What each server can do", value: "Varies by server and not assessed here.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.0.0, 2026-10-19", source: "github", url: "https://github.com/modelcontextprotocol/servers/releases" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/modelcontextprotocol/servers" },
      { label: "Open issues", value: `486, of which 164 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/modelcontextprotocol/servers/issues" },
      { label: "Archived servers", value: "The README lists many former reference servers as archived, such as GitHub, PostgreSQL, Puppeteer and Redis, some replaced by official servers from their vendors.", source: "github", url: "https://github.com/modelcontextprotocol/servers#readme" },
      { label: "License", value: "GitHub does not detect a single license for the repository.", source: "github", url: "https://github.com/modelcontextprotocol/servers" },
    ],
    hardening: [],
    alternative: {
      name: "MCP Registry",
      url: "https://registry.modelcontextprotocol.io/",
      note: "The README sends people looking for published servers to the registry, and keeps this repository for a small set of reference servers.",
      source: "github",
    },
  },
  {
    slug: "serena",
    version: "v2.0.0 (2026-10-13)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Giving a coding agent IDE-like tools for semantic code retrieval, editing, refactoring and debugging, working at the symbol level.", source: "github", url: "https://github.com/oraios/serena#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Backends", value: "Language servers (support for over 40 languages) or a paid JetBrains plugin with a free trial.", source: "github", url: "https://github.com/oraios/serena#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Yes. It offers editing and refactoring tools that act on your code.", source: "github", url: "https://github.com/oraios/serena#readme" },
      { label: "Shell commands and network", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.0.0, 2026-10-13", source: "github", url: "https://github.com/oraios/serena/releases" },
      { label: "Last push", value: "2026-10-15", source: "github", url: "https://github.com/oraios/serena" },
      { label: "Open issues", value: `100, of which 32 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/oraios/serena/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/oraios/serena" },
      { label: "License", value: "GPL-3.0-or-later according to the README badge. GitHub does not detect a license.", source: "github", url: "https://github.com/oraios/serena" },
    ],
    hardening: [],
  },
  {
    slug: "n8n-mcp",
    version: "v2.94.3 (2026-10-19)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Building and managing n8n workflows from an AI client.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
      { label: "Not made for", value: "Editing production workflows directly. The README warns never to do it with AI and to work on a copy, test first and keep backups.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README lists tools for workflows, executions, credentials, audits and more.", source: "unknown" },
      { label: "Ways to expose fewer tools", value: "The DISABLED_TOOLS and DISABLED_TOOL_OPERATIONS environment variables.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Yes. It has tools to create, update, delete and test workflows in your n8n instance.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
      { label: "Credentials in n8n", value: "A tool, n8n_manage_credentials, can list, get, create, update and delete n8n credentials. The README removes it, even for reads, in its read-only recipe.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#read-only-deployment" },
      { label: "Secrets it needs", value: "An n8n API key. For instance-level MCP, a separate access token.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
      { label: "Hosted option", value: "The README offers a hosted service with a free tier of 100 tool calls a day.", source: "github", url: "https://github.com/czlonkowski/n8n-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.94.3, 2026-10-19", source: "github", url: "https://github.com/czlonkowski/n8n-mcp/releases" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/czlonkowski/n8n-mcp" },
      { label: "Open issues", value: `64, of which 16 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/czlonkowski/n8n-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json and ui-apps/package-lock.json", source: "github", url: "https://github.com/czlonkowski/n8n-mcp" },
    ],
    hardening: [
      {
        title: "Switch off the write and credential tools",
        note: "The project's own read-only recipe. It recommends combining it with a read-only n8n API key.",
        language: "bash",
        code: "DISABLED_TOOLS=n8n_create_workflow,n8n_update_full_workflow,n8n_update_partial_workflow,n8n_delete_workflow,n8n_autofix_workflow,n8n_deploy_template,n8n_test_workflow,n8n_manage_credentials,n8n_manage_datatable",
        source: "github",
        url: "https://github.com/czlonkowski/n8n-mcp#read-only-deployment",
      },
    ],
  },
  {
    slug: "mcp-toolbox-for-databases",
    version: "v1.14.0 (2026-10-08)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Connecting AI clients and agents to databases, with prebuilt tools or custom tools you define in a tools.yaml file.", source: "github", url: "https://github.com/googleapis/mcp-toolbox#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Depends on the database. Prebuilt tools are listed in the project's reference, and custom tools are your own.", source: "github", url: "https://github.com/googleapis/mcp-toolbox#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Depends on the tools you enable or define. Not assessed.", source: "unknown" },
      { label: "Telemetry", value: "Emits traces and metrics through OpenTelemetry, to an endpoint you configure with --telemetry-otlp.", source: "github", url: "https://github.com/googleapis/mcp-toolbox#readme" },
      { label: "Credentials", value: "Database connection settings in environment variables; integrated authentication (IAM) is mentioned for Google Cloud.", source: "github", url: "https://github.com/googleapis/mcp-toolbox#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v1.14.0, 2026-10-08", source: "github", url: "https://github.com/googleapis/mcp-toolbox/releases" },
      { label: "Last push", value: "2026-10-17", source: "github", url: "https://github.com/googleapis/mcp-toolbox" },
      { label: "Open issues", value: `396, of which 97 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/googleapis/mcp-toolbox/issues" },
      { label: "Dependency lockfiles", value: "go.sum", source: "github", url: "https://github.com/googleapis/mcp-toolbox" },
    ],
    hardening: [],
    alternative: {
      name: "Google Cloud managed MCP servers",
      url: "https://cloud.google.com/blog/products/databases/managed-mcp-servers-for-google-cloud-databases",
      note: "The README points users who want a managed solution to Google Cloud's managed MCP servers.",
      source: "github",
    },
  },
  {
    slug: "firecrawl-mcp-server",
    version: "v3.2.1 (2025-09-26)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Giving an AI client web scraping, search and crawling through Firecrawl, in its cloud or on a self-hosted instance.", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "27 when the full profile registers with default settings, per the README. Environment flags remove the feedback tools, and the hosted keyless endpoint exposes only 3.", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Where it sends requests", value: "To Firecrawl's cloud API by default, or to a self-hosted instance through FIRECRAWL_API_URL.", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server#readme" },
      { label: "Credentials", value: "A Firecrawl API key for the cloud. A keyless free tier covers scrape, search and parse with rate limits. The README says never to put the key in the server URL or an agent chat.", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Data handling policy", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest GitHub release", value: "v3.2.1, 2025-09-26. Newer versions are published on npm instead: the firecrawl-mcp package was at 3.33.1 on 2026-10-19.", source: "registry", url: "https://www.npmjs.com/package/firecrawl-mcp" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server" },
      { label: "Open issues", value: `173, of which 72 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/firecrawl/firecrawl-mcp-server" },
    ],
    hardening: [],
  },
  {
    slug: "mongodb-mcp-server",
    version: "v3.1.1-pre.1 (2026-10-15), a pre-release",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Letting an AI client work with MongoDB databases and MongoDB Atlas.", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Yes, unless you start it with --readOnly (or MDB_MCP_READ_ONLY=true). The README's examples include read-only mode by default.", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server#readme" },
      { label: "Credentials", value: "A MongoDB connection string or Atlas service-account credentials. The README advises minimum permissions and passing secrets through environment variables, not command-line arguments.", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v3.1.1-pre.1, 2026-10-15 (pre-release)", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server/releases" },
      { label: "Last push", value: "2026-10-18", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server" },
      { label: "Open issues", value: `29, of which 3 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/mongodb-js/mongodb-mcp-server" },
    ],
    hardening: [
      {
        title: "Run it read-only",
        note: "From the project's README. Use your own connection string; the one below is the README's local example.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "MongoDB": {\n      "command": "npx",\n      "args": ["-y", "mongodb-mcp-server@latest", "--readOnly"],\n      "env": {\n        "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/myDatabase"\n      }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/mongodb-js/mongodb-mcp-server#readme",
      },
    ],
  },
  {
    slug: "dbhub",
    version: "v1.5.0 (2026-10-09)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Connecting AI clients to several kinds of databases through a small set of tools.", source: "github", url: "https://github.com/bytebase/dbhub#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "2 by default (execute_sql, search_objects), 2 opt-in (explain_sql, health_check), plus custom tools defined in dbhub.toml.", source: "github", url: "https://github.com/bytebase/dbhub#readme" },
      { label: "Token weight of the definitions", value: "The README claims the 2 default tools load at about 1.4k tokens, 13 to 14 times fewer than alternatives. We did not verify it.", source: "github", url: "https://github.com/bytebase/dbhub#readme" },
    ],
    permissions: [
      { label: "Read-only mode", value: "Set readonly = true on the execute_sql tool. DBHub then checks each statement against an allow-list of read-only keywords and runs it under the database's own read-only mechanism (engine-level enforcement was added in 0.22.6). It is not on by default.", source: "official", url: "https://github.com/bytebase/dbhub/blob/main/docs/tools/execute-sql.mdx" },
      { label: "Other guardrails", value: "The README also lists row limiting and a query timeout.", source: "github", url: "https://github.com/bytebase/dbhub#readme" },
      { label: "Credentials", value: "A database connection string (DSN), as in the README's example.", source: "github", url: "https://github.com/bytebase/dbhub#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v1.5.0, 2026-10-09", source: "github", url: "https://github.com/bytebase/dbhub/releases" },
      { label: "Last push", value: "2026-10-13", source: "github", url: "https://github.com/bytebase/dbhub" },
      { label: "Open issues", value: `2, of which 1 was opened before ${STALE_REF}`, source: "github", url: "https://github.com/bytebase/dbhub/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/bytebase/dbhub" },
    ],
    hardening: [
      {
        title: "Make execute_sql read-only",
        note: "From DBHub's documentation for the execute_sql tool. Replace the connection string with your own.",
        language: "bash",
        code: '[[sources]]\nid = "production"\ndsn = "postgres://user:pass@localhost:5432/mydb"\n\n[[tools]]\nname = "execute_sql"\nsource = "production"\nreadonly = true',
        source: "official",
        url: "https://github.com/bytebase/dbhub/blob/main/docs/tools/execute-sql.mdx",
      },
    ],
  },
  {
    slug: "browser-tools-mcp",
    version: "v2.0.2 (2026-08-12)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Streaming console output, network activity, screenshots and Lighthouse audits from your real Chrome session to an AI client.", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
      { label: "Not made for", value: "Version 1.x. The README says 1.2.x has a critical vulnerability and tells users to upgrade to 2.0, a rewrite.", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "16 listed in the README table (counted by us).", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Browser data", value: "Captures whatever your browser sees in the session, which can be one already logged into your app.", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
      { label: "Safeguards in 2.0", value: "Binds to loopback only, requires a per-run token, scrubs credentials to [REDACTED], keeps headers off by default and makes cookie access an optional permission.", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
      { label: "Option to avoid", value: "--no-redact turns credential scrubbing off. The README says not to.", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.0.2, 2026-08-12", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp" },
      { label: "Open issues", value: `5, of which 0 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/AgentDeskAI/browser-tools-mcp" },
    ],
    hardening: [],
  },
  {
    slug: "aws-mcp-servers",
    version: "release 2026.10.20261015170211 (2026-10-16)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "A collection of MCP servers for AWS services, from documentation and infrastructure as code to databases and IAM.", source: "github", url: "https://github.com/awslabs/mcp#readme" },
      { label: "Not made for", value: "New production work with coding agents. The README recommends the Agent Toolkit for AWS instead, and says this repository keeps working and accepting contributions.", source: "github", url: "https://github.com/awslabs/mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The repository holds many servers, each with its own tools.", source: "unknown" },
    ],
    permissions: [
      { label: "What each server can do", value: "Varies by server. The README lists servers that manage AWS resources, such as IAM and database servers. Not assessed here.", source: "github", url: "https://github.com/awslabs/mcp#readme" },
      { label: "Deprecated servers", value: "The README marks some servers as deprecated, for example the Cloud Control API MCP Server, pointing to the AWS IaC MCP Server.", source: "github", url: "https://github.com/awslabs/mcp#readme" },
    ],
    maintenance: [
      { label: "Latest release", value: "2026.10.20261015170211, 2026-10-16", source: "github", url: "https://github.com/awslabs/mcp/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/awslabs/mcp" },
      { label: "Open issues", value: `241, of which 115 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/awslabs/mcp/issues" },
      { label: "Dependency lockfiles", value: "Per server; not checked. The repository root has none.", source: "unknown" },
    ],
    hardening: [],
    alternative: {
      name: "Agent Toolkit for AWS",
      url: "https://aws.amazon.com/about-aws/whats-new/2026/05/agent-toolkit/",
      note: "Described in the README as the successor to the MCP servers, plugins and skills in this repository, recommended for production software built with coding agents.",
      source: "github",
    },
  },

  // ---- Tercera tanda: revisión 2026-10-19 ----
  {
    slug: "apify-mcp-server",
    version: "v0.18.4 (2026-10-16)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Letting AI agents run Apify Actors to extract data from websites, search engines, maps and e-commerce sites.", source: "github", url: "https://github.com/apify/apify-mcp-server#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README has tables of tools, and you can pass an explicit tools= list to choose which load.", source: "github", url: "https://github.com/apify/apify-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "An Apify API token (or OAuth on the hosted endpoint mcp.apify.com).", source: "github", url: "https://github.com/apify/apify-mcp-server#readme" },
      { label: "Spending", value: "Actor runs are paid. The README also describes ways for autonomous agents to pay without an account: AGI, x402 and Skyfire.", source: "github", url: "https://github.com/apify/apify-mcp-server#readme" },
      { label: "Sends data to third parties", value: "Telemetry about tool calls is enabled by default, with Sentry error tracking. Opt out with --telemetry-enabled=false or TELEMETRY_ENABLED=false.", source: "github", url: "https://github.com/apify/apify-mcp-server#-telemetry" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.18.4, 2026-10-16", source: "github", url: "https://github.com/apify/apify-mcp-server/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/apify/apify-mcp-server" },
      { label: "Open issues", value: `183, of which 51 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/apify/apify-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/apify/apify-mcp-server" },
    ],
    hardening: [
      {
        title: "Turn off telemetry",
        note: "Combines the two lines the README documents: the APIFY_TOKEN environment variable and the telemetry flag. Use your own token.",
        language: "bash",
        code: "APIFY_TOKEN=<your-token> npx @apify/actors-mcp-server --telemetry-enabled=false",
        source: "github",
        url: "https://github.com/apify/apify-mcp-server#-telemetry",
      },
    ],
  },
  {
    slug: "blender-mcp",
    version: "no GitHub release; last push 2026-10-06",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Letting an AI client work inside Blender, for example modeling, materials and scene control.", source: "github", url: "https://github.com/ahujasid/mcp-for-blender#readme" },
      { label: "Not made for", value: "Unattended use in production without care. The README says to always save your work before using its code-execution tool. It is also a third-party integration, not made by Blender.", source: "github", url: "https://github.com/ahujasid/mcp-for-blender#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Code execution", value: "By default the AI can run any Python code in Blender through execute_blender_code. Safe mode blocks scripts that read or write files directly, run other programs, use the network or install code that outlives the script.", source: "github", url: "https://github.com/ahujasid/mcp-for-blender#safe-mode" },
      { label: "Network", value: "The Blender add-on listens on localhost. The README advises keeping it there unless you are on a trusted network, and preferring an SSH tunnel. Poly Haven downloads can be turned off in Blender.", source: "github", url: "https://github.com/ahujasid/mcp-for-blender#readme" },
      { label: "Sends data to third parties", value: "A minimal anonymous usage record is collected by default (install and session IDs, tool name, success, duration, versions, OS, timestamp). Prompts, generated code, screenshots and scene data are collected only if you opt in. DISABLE_TELEMETRY=true turns it all off.", source: "github", url: "https://github.com/ahujasid/mcp-for-blender#telemetry-control" },
    ],
    maintenance: [
      { label: "Latest release", value: "None published on GitHub", source: "github", url: "https://github.com/ahujasid/mcp-for-blender/releases" },
      { label: "Last push", value: "2026-10-06", source: "github", url: "https://github.com/ahujasid/mcp-for-blender" },
      { label: "Open issues", value: `27, of which 0 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/ahujasid/mcp-for-blender/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/ahujasid/mcp-for-blender" },
    ],
    hardening: [
      {
        title: "Safe mode and no telemetry",
        note: "Both variables are documented in the project's README. We put them on one command.",
        language: "bash",
        code: "BLENDER_MCP_SAFE_MODE=1 DISABLE_TELEMETRY=true uvx mcp-for-blender",
        source: "github",
        url: "https://github.com/ahujasid/mcp-for-blender#safe-mode",
      },
    ],
  },
  {
    slug: "unity-mcp",
    version: "v10.3.0 (2026-10-04)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Connecting AI assistants to the Unity Editor to build projects with LLMs.", source: "github", url: "https://github.com/CoplayDev/unity-mcp#readme" },
      { label: "Not made for", value: "Not stated. The README says it is not affiliated with Unity Technologies, and that it is sponsored and maintained by Aura, which also sells a paid assistant.", source: "github", url: "https://github.com/CoplayDev/unity-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The documentation describes tool groups such as vfx, animation, ui and testing.", source: "github", url: "https://github.com/CoplayDev/unity-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "What it can do in the Editor", value: "Not assessed. The README is short and points to external documentation.", source: "unknown" },
      { label: "Remote use", value: "The documentation lists a remote-hosted server with authentication.", source: "github", url: "https://github.com/CoplayDev/unity-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v10.3.0, 2026-10-04", source: "github", url: "https://github.com/CoplayDev/unity-mcp/releases" },
      { label: "Last push", value: "2026-10-17", source: "github", url: "https://github.com/CoplayDev/unity-mcp" },
      { label: "Open issues", value: `50, of which 29 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/CoplayDev/unity-mcp/issues" },
      { label: "Dependency lockfiles", value: "None found at the repository root.", source: "github", url: "https://github.com/CoplayDev/unity-mcp" },
    ],
    hardening: [],
  },
  {
    slug: "ida-pro-mcp",
    version: "1.4.0 (2025-10-06)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "AI-assisted reverse engineering in IDA Pro.", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp#readme" },
      { label: "Not made for", value: "IDA Free, which is not supported. The author also recommends the official Hex-Rays server instead.", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. Debugger tools are hidden by default and enabled with ?ext=dbg.", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Code execution", value: "py_eval executes arbitrary Python code in the IDA context.", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "1.4.0, 2025-10-06. The README now recommends the official Hex-Rays server.", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp/releases" },
      { label: "Last push", value: "2026-09-26", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp" },
      { label: "Open issues", value: `37, of which 28 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/mrexodia/ida-pro-mcp/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/mrexodia/ida-pro-mcp" },
    ],
    hardening: [],
    alternative: {
      name: "Official Hex-Rays IDA MCP server",
      url: "https://github.com/HexRaysSA/ida-mcp",
      note: "The author's own README opens by recommending it instead of this project.",
      source: "github",
    },
  },
  {
    slug: "talk-to-figma-mcp",
    version: "no GitHub release; last push 2026-07-26",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Letting an AI agent such as Cursor or Claude Code read and modify Figma designs, through a Figma plugin and a local WebSocket server.", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README lists them under MCP Tools.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Can change data", value: "Yes. It can modify designs in Figma.", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp#readme" },
      { label: "What you run", value: "A WebSocket server and a Figma plugin, which connect to the MCP server through a channel.", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "None published on GitHub", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp/releases" },
      { label: "Last push", value: "2026-07-26 (85 days before review): low activity", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp" },
      { label: "Open issues", value: `67, of which 67 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp/issues" },
      { label: "Dependency lockfiles", value: "bun.lock", source: "github", url: "https://github.com/grab/cursor-talk-to-figma-mcp" },
    ],
    hardening: [],
  },
  {
    slug: "codebase-memory-mcp",
    version: "v0.12.1 (2026-10-16)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Indexing a codebase locally into a graph so an AI client can search it with fewer tokens.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "17, per the README.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
      { label: "Token weight", value: "The README reports about 120 times fewer tokens in its own five-query comparison (about 3,400 against 412,000 with file-by-file search). We did not verify it.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
    ],
    permissions: [
      { label: "Sends data to third parties", value: "The README says it runs 100% locally and collects no telemetry. An optional browser feature can download a model from Hugging Face after you enable it. We did not verify the claim.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
      { label: "Changes to your setup", value: "The installer writes agent configuration for supported clients.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
      { label: "Credentials", value: "None: indexing and graph queries need no hosted service or API key.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp#readme" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.12.1, 2026-10-16", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp/releases" },
      { label: "Last push", value: "2026-10-18", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp" },
      { label: "Open issues", value: `491, of which 129 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/DeusData/codebase-memory-mcp/issues" },
      { label: "Dependency lockfiles", value: "None found at the repository root.", source: "github", url: "https://github.com/DeusData/codebase-memory-mcp" },
    ],
    hardening: [],
  },
  {
    slug: "context-mode",
    version: "v1.0.169 (2026-06-29)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Keeping raw tool output out of the model's context window by running processing in sandboxed subprocesses and a local SQLite index.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "11 ctx_* tools, per the README.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
      { label: "Token weight", value: "The README gives savings figures from its own examples, such as 315 KB reduced to 5.4 KB. We did not verify them.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
    ],
    permissions: [
      { label: "Hooks into your client", value: "It registers hooks (PreToolUse, PostToolUse, UserPromptSubmit, PreCompact, SessionStart, Stop) that can redirect or block tool calls before they run.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
      { label: "Code execution", value: "Each ctx_execute call spawns a separate subprocess. The README describes a process boundary, not a security sandbox.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
      { label: "Sends data to third parties", value: "The README says nothing leaves your machine: no telemetry, no cloud sync. One command opens a hosted dashboard in your browser. We did not verify the claim.", source: "github", url: "https://github.com/mksglu/context-mode#readme" },
    ],
    maintenance: [
      { label: "Latest release", value: "v1.0.169, 2026-06-29", source: "github", url: "https://github.com/mksglu/context-mode/releases" },
      { label: "Last push", value: "2026-10-18", source: "github", url: "https://github.com/mksglu/context-mode" },
      { label: "Open issues", value: "0 found by our search; issues may be disabled or tracked elsewhere.", source: "unknown" },
      { label: "Dependency lockfiles", value: "bun.lock", source: "github", url: "https://github.com/mksglu/context-mode" },
      { label: "License", value: "GitHub does not detect a license. Not verified.", source: "unknown" },
    ],
    hardening: [],
  },
  {
    slug: "data-api-builder",
    version: "v2.1.5 (2026-10-01)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Turning a database into REST and GraphQL endpoints without code, running in a container. The README lists MCP alongside them.", source: "github", url: "https://github.com/Azure/data-api-builder#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "What gets exposed", value: "Depends on the permissions you configure per role. The README's quick-start example grants the anonymous role all actions on an entity, so adapt it before exposing real data.", source: "github", url: "https://github.com/Azure/data-api-builder#readme" },
      { label: "Authentication", value: "Configurable in the config file.", source: "github", url: "https://github.com/Azure/data-api-builder#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.1.5, 2026-10-01", source: "github", url: "https://github.com/Azure/data-api-builder/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/Azure/data-api-builder" },
      { label: "Open issues", value: `492, of which 456 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/Azure/data-api-builder/issues" },
      { label: "Dependency lockfiles", value: "None found at the repository root.", source: "github", url: "https://github.com/Azure/data-api-builder" },
    ],
    hardening: [],
  },
  {
    slug: "graphjin",
    version: "v3.21.16 (2026-10-18)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Giving AI agents one governed GraphQL and MCP surface over databases, warehouses, files and other systems.", source: "github", url: "https://github.com/dosco/graphjin#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README names tools such as query_catalog, graphql_help, gj_config, gj_watch, gj_security, gj_runtime and ask_graphjin_agent.", source: "github", url: "https://github.com/dosco/graphjin#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Guardrails listed", value: "Source-mode access, query allow-lists, read-only boundaries, policy-aware tools and local encrypted secrets.", source: "github", url: "https://github.com/dosco/graphjin#readme" },
      { label: "Built-in agent", value: "A built-in agent runs the discovery loop as the caller, under the caller's permissions.", source: "github", url: "https://github.com/dosco/graphjin#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v3.21.16, 2026-10-18", source: "github", url: "https://github.com/dosco/graphjin/releases" },
      { label: "Last push", value: "2026-10-18", source: "github", url: "https://github.com/dosco/graphjin" },
      { label: "Open issues", value: `22, of which 19 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/dosco/graphjin/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/dosco/graphjin" },
    ],
    hardening: [],
  },
  {
    slug: "prest",
    version: "v2.5.2 (2026-10-19)",
    reviewedAt: D2,
    use: [
      { label: "Made for", value: "Instant REST and MCP APIs on a SQL database, with auth and access control. PostgreSQL is the default engine, and MySQL has its own dialect since v2.5.0.", source: "github", url: "https://github.com/prest/prest#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "MCP access", value: "The README describes a read-only MCP, including on MySQL from v2.5.1. The MCP lists only the databases the server serves.", source: "github", url: "https://github.com/prest/prest#readme" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.5.2, 2026-10-19", source: "github", url: "https://github.com/prest/prest/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/prest/prest" },
      { label: "Open issues", value: `139, of which 134 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/prest/prest/issues" },
      { label: "Dependency lockfiles", value: "go.sum", source: "github", url: "https://github.com/prest/prest" },
    ],
    hardening: [],
  },
  // --- Tercera oleada (2026-10-20): datos de GitHub y registros comprobados el mismo día ---
  {
    slug: "supabase-mcp",
    version: "v0.14.0 (2026-10-14)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Connecting Supabase projects to AI assistants so they can manage tables, fetch config and query data.", source: "github", url: "https://github.com/supabase/mcp#readme" },
      { label: "Not made for", value: "Not stated by the project. The README asks you to read Supabase's security best practices before connecting an LLM to your projects.", source: "github", url: "https://github.com/supabase/mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The full list is on supabase.com/mcp.", source: "github", url: "https://github.com/supabase/mcp#readme" },
      { label: "Ways to expose fewer tools", value: "URL parameters: features (feature groups), project_ref (one project, no account-level tools) and read_only=true.", source: "github", url: "https://github.com/supabase/mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "You log in to Supabase through OAuth when the client connects, and choose the organization. The local CLI and self-hosted servers offer a limited subset of tools and no OAuth 2.1.", source: "github", url: "https://github.com/supabase/mcp#readme" },
      { label: "Can change data", value: "Yes by default: it can manage tables and query data. With read_only=true the server omits the tools that modify data.", source: "github", url: "https://github.com/supabase/mcp#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "mcp-server-supabase-v0.14.0, 2026-10-14", source: "github", url: "https://github.com/supabase/mcp/releases" },
      { label: "Last push", value: "2026-10-20", source: "github", url: "https://github.com/supabase/mcp" },
      { label: "Open issues", value: `76, of which 61 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/supabase/mcp/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/supabase/mcp" },
    ],
    hardening: [
      {
        title: "Limit it to one project, read-only",
        note: "The README's example URL. Replace the placeholder with your project reference. read_only=true removes the tools that modify data, project_ref limits it to one project and features limits the groups of tools.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "supabase": {\n      "type": "http",\n      "url": "https://mcp.supabase.com/mcp?project_ref=<project-ref>&read_only=true&features=database,docs"\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/supabase/mcp#readme",
      },
    ],
  },
  {
    slug: "notion-mcp-server",
    version: "v2.1.0 (2026-01-31); npm shows 2.5.2",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving an AI client access to the Notion API (search, pages, data sources) from a server you run yourself.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "Not made for", value: "The README says this repository is a separate self-hosted implementation that is no longer actively maintained or supported, and points to Notion's hosted Remote Notion MCP instead.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
    ],
    context: [
      { label: "Tools", value: "22, according to the README's notes for version 2.0.0.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "Ways to expose fewer tools", value: "Not stated. The README limits access through the Notion integration instead: only the pages and databases you connect to it are reachable.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A Notion integration token (NOTION_TOKEN). You also connect the pages and databases you want to expose to that integration.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "Can change data", value: "Yes, in Notion. The README says the exposed API scope is limited (you cannot delete databases) but that there is still a non-zero risk to workspace data. It suggests a read-only integration token, with only \"Read content\" access.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "HTTP transport", value: "The Streamable HTTP transport requires a bearer token. An --unsafe-disable-auth flag exists; the README warns that the server may then be reachable from pages you visit through DNS rebinding.", source: "github", url: "https://github.com/makenotion/notion-mcp-server#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.1.0, 2026-01-31", source: "github", url: "https://github.com/makenotion/notion-mcp-server/releases" },
      { label: "Latest npm version", value: "2.5.2", source: "registry", url: "https://www.npmjs.com/package/@notionhq/notion-mcp-server" },
      { label: "Last push", value: "2026-09-20", source: "github", url: "https://github.com/makenotion/notion-mcp-server" },
      { label: "Open issues", value: `158, of which 149 were opened before ${STALE_REF}. The README says issues and pull requests here are not actively monitored.`, source: "github", url: "https://github.com/makenotion/notion-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/makenotion/notion-mcp-server" },
    ],
    hardening: [
      {
        title: "Use a read-only integration token",
        note: "In your Notion integration settings, give it only \"Read content\" access and connect only the pages you need. Then use that token here. The README describes the token setup; the command is the usual npx form.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "notion": {\n      "command": "npx",\n      "args": ["-y", "@notionhq/notion-mcp-server"],\n      "env": { "NOTION_TOKEN": "<read-only-integration-token>" }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/makenotion/notion-mcp-server#readme",
      },
    ],
    alternative: { name: "Remote Notion MCP", url: "https://developers.notion.com/docs/mcp", note: "The hosted server Notion recommends instead of this repository. It uses OAuth and respects each user's Notion permissions.", source: "github" },
  },
  {
    slug: "terraform-mcp-server",
    version: "v1.3.0 (2026-08-26)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Connecting AI clients to the Terraform Registry and to HCP Terraform and Terraform Enterprise for infrastructure-as-code work.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Not made for", value: "The README says not to use it with untrusted MCP clients or LLMs, because queries may expose Terraform data to them.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README has an Available Tools section.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Ways to expose fewer tools", value: "Toolsets (--toolsets) and individual tools (--tools). Tools that need explicit approval stay off unless ENABLE_TF_OPERATIONS is set to true.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "TFE_TOKEN and TFE_ADDRESS, for the authenticated HCP Terraform and Terraform Enterprise tools.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Can change data", value: "Yes, in HCP Terraform and Terraform Enterprise: the README lists creating, updating and deleting workspaces, with variables, tags and run management.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "HTTP mode", value: "Binds to 127.0.0.1 by default, with strict CORS by default. An organization allowlist and allowed origins can be set.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Telemetry", value: "Optional OpenTelemetry metrics of tool use, off by default (OTEL_METRICS_ENABLED=false), sent to the endpoint you configure.", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v1.3.0, 2026-08-26", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server/releases" },
      { label: "Last push", value: "2026-10-20", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server" },
      { label: "Open issues", value: `10, of which 6 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/hashicorp/terraform-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "go.sum", source: "github", url: "https://github.com/hashicorp/terraform-mcp-server" },
    ],
    hardening: [
      {
        title: "Run it in Docker with a narrow token",
        note: "The README's Docker form. Replace the placeholders. Create the token with only the permissions you need and leave ENABLE_TF_OPERATIONS unset so that the approval-gated tools stay off.",
        language: "bash",
        code: "docker run -i --rm \\\n  -e TFE_TOKEN=<your-token> \\\n  -e TFE_ADDRESS=<your-address> \\\n  hashicorp/terraform-mcp-server",
        source: "github",
        url: "https://github.com/hashicorp/terraform-mcp-server#readme",
      },
    ],
  },
  {
    slug: "bright-data-mcp",
    version: "v4.0.0 (2026-10-18)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving AI agents web search, page scraping, structured data from pre-built scrapers and browser automation, through Bright Data's infrastructure.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
      { label: "Cost", value: "A free tier of 5,000 requests per month, according to the README. See its pricing section for what comes after.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
    ],
    context: [
      { label: "Tools", value: "32, according to the README.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Ways to expose fewer tools", value: "On the hosted server, the groups= and tools= URL parameters limit the tools.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A Bright Data API token: API_TOKEN for the local server, or a token= parameter in the hosted URL. OAuth is also described for the hosted server.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Can change data", value: "Not stated. The documented tools search, scrape and drive a remote browser session (navigate, click, type).", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Sends data to third parties", value: "Yes, by design: the README says every request is routed through Bright Data's infrastructure, and one tool group sends prompts to ChatGPT and Perplexity and returns their answers.", source: "github", url: "https://github.com/brightdata/brightdata-mcp#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v4.0.0, 2026-10-18", source: "github", url: "https://github.com/brightdata/brightdata-mcp/releases" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/brightdata/brightdata-mcp" },
      { label: "Open issues", value: `14, of which 8 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/brightdata/brightdata-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/brightdata/brightdata-mcp" },
    ],
    hardening: [
      {
        title: "Expose only the tools you use",
        note: "On the hosted server, the tools= parameter limits the tools; the README's example keeps only search and Markdown scraping. Replace the placeholder with your token.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "brightdata": {\n      "url": "https://mcp.brightdata.com/mcp?token=<your-api-token>&tools=search_engine,scrape_as_markdown"\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/brightdata/brightdata-mcp#readme",
      },
    ],
  },
  {
    slug: "exa-mcp-server",
    version: "3.4.2 on npm (no GitHub releases)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Connecting AI agents to Exa for web search, content fetching and multi-step research.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Two by default (web_search_exa and web_fetch_exa). web_search_advanced_exa and agent_run are optional.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Ways to expose fewer tools", value: "The tools parameter on the MCP URL replaces the defaults, so you list exactly the tools you want.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "None needed for the hosted server, which works anonymously with rate limits. OAuth or an API key raise the limits, and Exa Agent requires one of them. The key can go in the URL, in an Authorization header or in x-api-key.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Can change data", value: "Not stated. The documented tools search and fetch web content, and agent_run starts an Exa Agent.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Sends data to third parties", value: "Yes, by design: your queries and URLs go to Exa's hosted service. The README does not state retention.", source: "github", url: "https://github.com/exa-labs/exa-mcp-server#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "No GitHub releases. Latest npm version: 3.4.2", source: "registry", url: "https://www.npmjs.com/package/exa-mcp-server" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/exa-labs/exa-mcp-server" },
      { label: "Open issues", value: `12, of which 2 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/exa-labs/exa-mcp-server/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/exa-labs/exa-mcp-server" },
    ],
    hardening: [
      {
        title: "Send the key in a header, not in the URL",
        note: "The README says the key can go in an Authorization header. A key in the URL is easier to leak through logs and screenshots. The exact field for headers depends on your client.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "exa": {\n      "type": "http",\n      "url": "https://mcp.exa.ai/mcp",\n      "headers": { "Authorization": "Bearer <your-exa-api-key>" }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/exa-labs/exa-mcp-server#readme",
      },
    ],
  },
  {
    slug: "tavily-mcp",
    version: "0.2.22 on npm (no GitHub releases)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving AI clients web search, page extraction, site mapping and crawling through Tavily.", source: "github", url: "https://github.com/tavily-ai/tavily-mcp#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Search, extract, map and crawl, named in the README. The count is not stated.", source: "github", url: "https://github.com/tavily-ai/tavily-mcp#readme" },
      { label: "Ways to expose fewer tools", value: "Not stated.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A Tavily API key: TAVILY_API_KEY for the local server, or tavilyApiKey in the remote URL or an Authorization header.", source: "github", url: "https://github.com/tavily-ai/tavily-mcp#readme" },
      { label: "Can change data", value: "Not stated. The documented tools read the web.", source: "github", url: "https://github.com/tavily-ai/tavily-mcp#readme" },
      { label: "Sends data to third parties", value: "Yes, by design: queries and URLs go to Tavily. If you set TAVILY_HUMAN_ID it is sent as an X-Human-Id header; the README says Tavily hashes it (SHA-256) before storing it.", source: "github", url: "https://github.com/tavily-ai/tavily-mcp#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "No GitHub releases. Latest npm version: 0.2.22", source: "registry", url: "https://www.npmjs.com/package/tavily-mcp" },
      { label: "Last push", value: "2026-10-15", source: "github", url: "https://github.com/tavily-ai/tavily-mcp" },
      { label: "Open issues", value: `40, of which 30 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/tavily-ai/tavily-mcp/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/tavily-ai/tavily-mcp" },
    ],
    hardening: [
      {
        title: "Pin the version",
        note: "Our recommendation, not the project's: a fixed version means an update cannot change what runs on your machine without you noticing. Check the registry for the version you have reviewed.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "tavily": {\n      "command": "npx",\n      "args": ["-y", "tavily-mcp@0.2.22"],\n      "env": { "TAVILY_API_KEY": "<your-api-key>" }\n    }\n  }\n}',
        source: "own-view",
      },
    ],
  },
  {
    slug: "framelink-mcp-for-figma",
    version: "v0.13.2 (2026-06-18)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving coding tools access to Figma design data. It simplifies the Figma API response to the layout and styling information that matters.", source: "github", url: "https://github.com/GLips/Figma-Context-MCP#readme" },
      { label: "Not made for", value: "Not stated. The README says the server is designed specifically for use with Cursor.", source: "github", url: "https://github.com/GLips/Figma-Context-MCP#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Ways to expose fewer tools", value: "Not stated.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured. The README says it trims the Figma response to reduce the context the model receives.", source: "github", url: "https://github.com/GLips/Figma-Context-MCP#readme" },
    ],
    permissions: [
      { label: "Credentials", value: "A Figma personal access token, given as --figma-api-key or as FIGMA_API_KEY.", source: "github", url: "https://github.com/GLips/Figma-Context-MCP#readme" },
      { label: "Can change data", value: "The README describes reading design data from Figma and mentions no write actions.", source: "github", url: "https://github.com/GLips/Figma-Context-MCP#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.13.2, 2026-06-18", source: "github", url: "https://github.com/GLips/Figma-Context-MCP/releases" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/GLips/Figma-Context-MCP" },
      { label: "Open issues", value: `8, of which 6 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/GLips/Figma-Context-MCP/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/GLips/Figma-Context-MCP" },
    ],
    hardening: [
      {
        title: "Keep the token out of the arguments",
        note: "The README's examples pass the key as an argument and also say you can set FIGMA_API_KEY in the env field. The env form keeps the key out of the command line. Use a token with the narrowest access Figma allows.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "Framelink MCP for Figma": {\n      "command": "npx",\n      "args": ["-y", "figma-developer-mcp", "--stdio"],\n      "env": { "FIGMA_API_KEY": "<your-figma-token>" }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/GLips/Figma-Context-MCP#readme",
      },
    ],
  },
  {
    slug: "grafana-mcp-server",
    version: "v2.0.2 (2026-10-07)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving an AI client access to a Grafana instance and the ecosystem around it (dashboards, datasources, alerting and other categories of tools).", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Not counted. The README groups them in categories, and several categories are off by default.", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Ways to expose fewer tools", value: "--enabled-tools to choose categories, a --disable-<category> flag for each category, and --disable-write to remove create and update tools.", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "GRAFANA_URL and a Grafana service account token (GRAFANA_SERVICE_ACCOUNT_TOKEN). The README says each tool needs specific RBAC permissions and mentions the built-in Editor role as a broad shortcut.", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Can change data", value: "Yes by default, through its create and update tools. --disable-write removes them, and the service account's permissions limit what is left.", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Tracing", value: "Tool-call arguments are included in OpenTelemetry spans only with --include-args-in-spans, which defaults to false.", source: "github", url: "https://github.com/grafana/mcp-grafana#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.0.2, 2026-10-07", source: "github", url: "https://github.com/grafana/mcp-grafana/releases" },
      { label: "Last push", value: "2026-10-20", source: "github", url: "https://github.com/grafana/mcp-grafana" },
      { label: "Open issues", value: `54, of which 32 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/grafana/mcp-grafana/issues" },
      { label: "Dependency lockfiles", value: "go.sum", source: "github", url: "https://github.com/grafana/mcp-grafana" },
    ],
    hardening: [
      {
        title: "Run it without write tools",
        note: "The README's quick start with the --disable-write flag added. Use a service account that can only read what you want the AI to see.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "grafana": {\n      "command": "uvx",\n      "args": ["mcp-grafana", "--disable-write"],\n      "env": {\n        "GRAFANA_URL": "http://localhost:3000",\n        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "<service-account-token>"\n      }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/grafana/mcp-grafana#readme",
      },
    ],
  },
  {
    slug: "google-workspace-mcp",
    version: "v2.1.0 (2026-10-09)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Controlling Google Calendar, Drive, Gmail, Docs, Sheets, Slides, Forms, Tasks, Contacts and Chat from AI clients.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "More than 120, according to the README, in three tiers: core, extended and complete.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Ways to expose fewer tools", value: "--tool-tier, --tools with the services you want, --read-only and per-service --permissions.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Token weight of the definitions", value: "Not measured. The README says the tiers keep context windows lean.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
    ],
    permissions: [
      { label: "Credentials", value: "Your own Google OAuth client (GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET) in a Google Cloud project you control, so you decide the scopes.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Can change data", value: "Yes by default, across the services you enable. A read-only mode (--read-only) limits it.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Local files", value: "Local file reads default to a managed attachment directory. The README says it blocks .env files and common credential folders such as ~/.ssh and ~/.aws.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Sends data to third parties", value: "The README says that by default it sends no data anywhere except Google's APIs, with no usage reporting or analytics, and that optional tracing is off unless you configure it.", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme" },
      { label: "Shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v2.1.0, 2026-10-09", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp/releases" },
      { label: "Last push", value: "2026-10-20", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp" },
      { label: "Open issues", value: `89, of which 62 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/taylorwilsdon/google_workspace_mcp" },
    ],
    hardening: [
      {
        title: "Read-only, only the services you need",
        note: "Built from the README's flags. Replace the placeholders with the OAuth client you created in your own Google Cloud project, and add or remove services in --tools.",
        language: "bash",
        code: 'export GOOGLE_OAUTH_CLIENT_ID="<client-id>"\nexport GOOGLE_OAUTH_CLIENT_SECRET="<client-secret>"\n\nuvx workspace-mcp --tool-tier core --tools gmail drive calendar --read-only',
        source: "github",
        url: "https://github.com/taylorwilsdon/google_workspace_mcp#readme",
      },
    ],
  },
  {
    slug: "perplexity-mcp-server",
    version: "1.3.0 on npm (no GitHub releases)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Giving AI assistants real-time web search, reasoning and research through the Perplexity Agent API and Search API.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Four: perplexity_search, perplexity_ask, perplexity_research and perplexity_reason.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Ways to expose fewer tools", value: "Not stated.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured. perplexity_ask and perplexity_reason accept max_tokens and max_tokens_per_page to cap the search context.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
    ],
    permissions: [
      { label: "Credentials", value: "PERPLEXITY_API_KEY for the local server. The hosted server takes the key in an Authorization header.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Can change data", value: "Not stated. The documented tools search and answer questions.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Sends data to third parties", value: "Yes, by design: your prompts go to Perplexity's API. The README does not state retention.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Self-hosted HTTP mode", value: "Binds to 127.0.0.1 by default, and ALLOWED_ORIGINS is empty by default, so no cross-origin browser requests are accepted.", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "No GitHub releases. Latest npm version: 1.3.0", source: "registry", url: "https://www.npmjs.com/package/@perplexity-ai/mcp-server" },
      { label: "Last push", value: "2026-10-19", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol" },
      { label: "Open issues", value: `7, of which 2 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/perplexityai/modelcontextprotocol/issues" },
      { label: "Dependency lockfiles", value: "package-lock.json", source: "github", url: "https://github.com/perplexityai/modelcontextprotocol" },
    ],
    hardening: [
      {
        title: "Pin the version",
        note: "Our recommendation, not the project's: a fixed version means an update cannot change what runs on your machine without you noticing.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "perplexity": {\n      "command": "npx",\n      "args": ["-y", "@perplexity-ai/mcp-server@1.3.0"],\n      "env": { "PERPLEXITY_API_KEY": "<your-api-key>" }\n    }\n  }\n}',
        source: "own-view",
      },
    ],
  },
  {
    slug: "redis-mcp-server",
    version: "0.5.1 (2026-08-05)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Letting an AI client manage and search data in Redis: strings, hashes, lists, sets, sorted sets, streams, pub/sub, JSON and vector search.", source: "github", url: "https://github.com/redis/mcp-redis#readme" },
      { label: "Not made for", value: "Not stated by the project.", source: "unknown" },
    ],
    context: [
      { label: "Tools", value: "Grouped by data type (string, hash, list, set, sorted set, pub/sub, streams, JSON) plus docs, query engine and server management. The count is not stated.", source: "github", url: "https://github.com/redis/mcp-redis#readme" },
      { label: "Ways to expose fewer tools", value: "Not stated.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A Redis URL (--url), or host, port and password. EntraID authentication is supported for Azure Managed Redis.", source: "github", url: "https://github.com/redis/mcp-redis#readme" },
      { label: "Can change data", value: "Yes: the tools set values, remove items, delete stream entries and publish messages. The README documents no read-only mode; it suggests a Redis ACL user instead.", source: "github", url: "https://github.com/redis/mcp-redis#readme" },
      { label: "Docs tool", value: "Searches Redis documentation through an HTTP API (MCP_DOCS_SEARCH_URL).", source: "github", url: "https://github.com/redis/mcp-redis#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "0.5.1, 2026-08-05", source: "github", url: "https://github.com/redis/mcp-redis/releases" },
      { label: "Last push", value: "2026-10-20", source: "github", url: "https://github.com/redis/mcp-redis" },
      { label: "Open issues", value: `11, of which 10 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/redis/mcp-redis/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/redis/mcp-redis" },
    ],
    hardening: [
      {
        title: "Connect with a read-only Redis user",
        note: "From the README. Create the user in Redis, then put its credentials in the server's connection settings. The ACL, not the MCP server, is what stops writes.",
        language: "bash",
        code: "ACL SETUSER readonlyuser on >mypassword ~* +@read -@write",
        source: "github",
        url: "https://github.com/redis/mcp-redis#readme",
      },
    ],
  },
  {
    slug: "qdrant-mcp-server",
    version: "v0.8.1 (2025-12-10)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "A semantic memory layer: storing and retrieving information in the Qdrant vector search engine.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Not made for", value: "Not stated. The README also calls the repository an example of how to create an MCP server for Qdrant.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
    ],
    context: [
      { label: "Tools", value: "Two: qdrant-store and qdrant-find.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Ways to expose fewer tools", value: "QDRANT_READ_ONLY=true disables qdrant-store.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "QDRANT_URL (or QDRANT_LOCAL_PATH for a local database) and, optionally, QDRANT_API_KEY.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Can change data", value: "Yes by default: qdrant-store writes to your collection. QDRANT_READ_ONLY=true turns it off.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Embeddings", value: "The only supported provider is fastembed, with sentence-transformers/all-MiniLM-L6-v2 as the default model.", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v0.8.1, 2025-12-10", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant/releases" },
      { label: "Last push", value: "2026-09-04", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant" },
      { label: "Open issues", value: `29, of which 23 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/qdrant/mcp-server-qdrant/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/qdrant/mcp-server-qdrant" },
    ],
    hardening: [
      {
        title: "Run it read-only",
        note: "Built from the README's environment variables. Replace the placeholders. With QDRANT_READ_ONLY set to true the store tool is not offered, so the AI can search but not write.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "qdrant": {\n      "command": "uvx",\n      "args": ["mcp-server-qdrant"],\n      "env": {\n        "QDRANT_URL": "<your-qdrant-url>",\n        "QDRANT_API_KEY": "<your-api-key>",\n        "COLLECTION_NAME": "<collection>",\n        "QDRANT_READ_ONLY": "true"\n      }\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/qdrant/mcp-server-qdrant#readme",
      },
    ],
  },
  {
    slug: "neon-mcp-server",
    version: "0.6.5 on npm (no GitHub releases)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "Working with Neon Postgres in natural language: creating projects and branches, running queries and migrations. The README describes a hosted server at mcp.neon.tech.", source: "github", url: "https://github.com/neondatabase/mcp-server-neon#readme" },
      { label: "Not made for", value: "Production. The README says it is intended for local development and IDE integrations only, and does not recommend it in production environments.", source: "github", url: "https://github.com/neondatabase/mcp-server-neon#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Ways to expose fewer tools", value: "On the MCP URL: readonly, projectId, category and roleName. Over OAuth you can also choose these on the consent page.", source: "github", url: "https://github.com/neondatabase/mcp-server-neon#readme" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "OAuth by default, or a Neon API key in an Authorization header. An organization's API key limits access to that organization's projects.", source: "github", url: "https://github.com/neondatabase/mcp-server-neon#readme" },
      { label: "Can change data", value: "Yes: it can create projects and branches and run migrations. Read-only mode (the read scope, or readonly on the URL) disables those writes.", source: "github", url: "https://github.com/neondatabase/mcp-server-neon#readme" },
      { label: "Local files and shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "No GitHub releases. Latest npm version: 0.6.5", source: "registry", url: "https://www.npmjs.com/package/@neondatabase/mcp-server-neon" },
      { label: "Last push", value: "2026-10-16", source: "github", url: "https://github.com/neondatabase/mcp-server-neon" },
      { label: "Open issues", value: `16, of which 8 were opened before ${STALE_REF}`, source: "github", url: "https://github.com/neondatabase/mcp-server-neon/issues" },
      { label: "Dependency lockfiles", value: "pnpm-lock.yaml", source: "github", url: "https://github.com/neondatabase/mcp-server-neon" },
    ],
    hardening: [
      {
        title: "Read-only, one project",
        note: "The README says readonly, projectId, category and roleName can go on the MCP URL, so the consent page confirms a fixed grant. Replace the placeholder with your project ID.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "neon": {\n      "type": "http",\n      "url": "https://mcp.neon.tech/mcp?readonly=true&projectId=<project-id>"\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/neondatabase/mcp-server-neon#readme",
      },
    ],
  },
  {
    slug: "motherduck-mcp-server",
    version: "v1.1.0 (2026-10-07)",
    reviewedAt: D3,
    use: [
      { label: "Made for", value: "SQL analytics for AI assistants over DuckDB: local files, in-memory databases, databases on S3 and MotherDuck.", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck#readme" },
      { label: "Not made for", value: "Not stated by the project. The README points to MotherDuck's hosted remote MCP for a fully managed option.", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck#readme" },
    ],
    context: [
      { label: "Tools", value: "Not counted.", source: "unknown" },
      { label: "Ways to expose fewer tools", value: "Not stated.", source: "unknown" },
      { label: "Token weight of the definitions", value: "Not measured.", source: "unknown" },
    ],
    permissions: [
      { label: "Credentials", value: "A MotherDuck token (motherduck_token) for MotherDuck databases. None is described for local files.", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck#readme" },
      { label: "Can change data", value: "Only with --read-write. The README's local-file example without that flag is read-only. Its in-memory dev example adds --read-write and --allow-switch-databases, which it calls full flexibility with no guardrails.", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck#readme" },
      { label: "Local files", value: "Yes: the local server can query local databases and ingest data from, and export data to, the local filesystem.", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck#readme" },
      { label: "Shell commands", value: "Not stated in the README.", source: "unknown" },
      { label: "Sends data to third parties", value: "Not verified.", source: "unknown" },
    ],
    maintenance: [
      { label: "Latest release", value: "v1.1.0, 2026-10-07", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck/releases" },
      { label: "Last push", value: "2026-10-07", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck" },
      { label: "Open issues", value: "0", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck/issues" },
      { label: "Dependency lockfiles", value: "uv.lock", source: "github", url: "https://github.com/motherduckdb/mcp-server-motherduck" },
    ],
    hardening: [
      {
        title: "Connect to a file in read-only mode",
        note: "The README's own example. Without --read-write the connection to a DuckDB file is read-only. Replace the path with your file.",
        language: "json",
        code: '{\n  "mcpServers": {\n    "DuckDB (read-only)": {\n      "command": "uvx",\n      "args": ["mcp-server-motherduck", "--db-path", "/absolute/path/to/your.duckdb"]\n    }\n  }\n}',
        source: "github",
        url: "https://github.com/motherduckdb/mcp-server-motherduck#readme",
      },
    ],
  },
];

export const getVerified = (slug: string) => VERIFIED.find((c) => c.slug === slug);
