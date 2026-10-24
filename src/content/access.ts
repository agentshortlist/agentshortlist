// Qué hace falta para empezar a usar cada servidor. Sale de la línea de credenciales de su ficha, no de suposiciones:
// si la ficha no lo documenta, no aparece aquí y se muestra como "Not verified". No recoge el precio del servicio de terceros.
export type Needs = "nothing" | "own-systems" | "keyless-tier" | "third-party" | "unknown";

export const NEEDS_LABEL: Record<Needs, string> = {
  nothing: "Nothing to sign up for",
  "own-systems": "Credentials for systems you run",
  "keyless-tier": "Works without a key, with limits",
  "third-party": "A third-party account, key, sign-in or paid product",
  unknown: "Not verified",
};

export type Access = { needs: Needs; note: string };

export const ACCESS: Record<string, Access> = {
  "playwright-mcp": { needs: "nothing", note: "The README asks for no credentials." },
  "codebase-memory-mcp": { needs: "nothing", note: "Indexing and graph queries need no hosted service or API key." },
  "excel-mcp-server": { needs: "nothing", note: "The server itself needs no credentials." },

  "exa-mcp-server": { needs: "keyless-tier", note: "The hosted server works anonymously with rate limits; OAuth or an API key raise them." },
  "firecrawl-mcp-server": { needs: "keyless-tier", note: "A keyless free tier covers scrape, search and parse with rate limits; the cloud service takes an API key." },

  "mysql-mcp-server": { needs: "own-systems", note: "A MySQL user and password for your own database." },
  dbhub: { needs: "own-systems", note: "A connection string (DSN) for your own database." },
  "mongodb-mcp-server": { needs: "own-systems", note: "A MongoDB connection string or Atlas service-account credentials." },
  "mcp-toolbox-for-databases": { needs: "own-systems", note: "Database connection settings for your own databases." },
  "redis-mcp-server": { needs: "own-systems", note: "A Redis URL or host, port and password." },
  "qdrant-mcp-server": { needs: "own-systems", note: "A Qdrant URL, or a local database path; the API key is optional." },
  "clickhouse-mcp-server": { needs: "own-systems", note: "A ClickHouse user and password for your own server." },
  "kubernetes-mcp-server": { needs: "own-systems", note: "Your kubeconfig or the in-cluster configuration." },
  "mcp-server-kubernetes": { needs: "own-systems", note: "Your kubeconfig, by default ~/.kube/config." },
  "home-assistant-mcp-server": { needs: "own-systems", note: "A long-lived access token from your own Home Assistant." },
  "grafana-mcp-server": { needs: "own-systems", note: "Your Grafana URL and a service account token." },
  "n8n-mcp": { needs: "own-systems", note: "An API key for your n8n instance." },
  "mcp-context-forge": { needs: "own-systems", note: "You run it yourself and must set JWT_SECRET_KEY and AUTH_ENCRYPTION_SECRET." },

  "github-mcp-server": { needs: "third-party", note: "A GitHub personal access token, or OAuth on the remote server." },
  "apify-mcp-server": { needs: "third-party", note: "An Apify API token, or OAuth on the hosted endpoint." },
  "supabase-mcp": { needs: "third-party", note: "A Supabase sign-in through OAuth." },
  "notion-mcp-server": { needs: "third-party", note: "A Notion integration token." },
  "terraform-mcp-server": { needs: "third-party", note: "TFE_TOKEN and TFE_ADDRESS for the HCP Terraform and Terraform Enterprise tools." },
  "bright-data-mcp": { needs: "third-party", note: "A Bright Data API token." },
  "tavily-mcp": { needs: "third-party", note: "A Tavily API key." },
  "framelink-mcp-for-figma": { needs: "third-party", note: "A Figma personal access token." },
  "google-workspace-mcp": { needs: "third-party", note: "Your own Google OAuth client in a Google Cloud project." },
  "perplexity-mcp-server": { needs: "third-party", note: "A Perplexity API key." },
  "neon-mcp-server": { needs: "third-party", note: "OAuth by default, or a Neon API key." },
  "motherduck-mcp-server": { needs: "third-party", note: "A MotherDuck token for MotherDuck databases; none is described for local files." },
  "atlassian-remote-mcp-server": { needs: "third-party", note: "OAuth 2.1, or an API token for headless use." },
  "stripe-agent-toolkit": { needs: "third-party", note: "OAuth on the hosted server, or a Stripe secret key locally." },
  "mcp-atlassian": { needs: "third-party", note: "An Atlassian API token and email for Cloud, or a Personal Access Token for Server or Data Center." },
  "datadog-mcp-server": { needs: "third-party", note: "Your own Datadog credentials, forwarded to Datadog's APIs." },
  "auth0-mcp-server": { needs: "third-party", note: "OAuth 2.0 device authorization in the browser." },
  "sentry-mcp": { needs: "third-party", note: "OAuth to Sentry on the remote server, or a user auth token for stdio." },
  "microsoft-mcp-catalog": { needs: "third-party", note: "Depends on the server; the Azure one uses your Azure CLI sign-in." },

  "aws-mcp-servers": { needs: "third-party", note: "The install steps say to configure AWS credentials with access to the services you use. The hosted AWS Knowledge server needs no credentials." },
  "ida-pro-mcp": { needs: "third-party", note: "Requires IDA Pro 8.3 or higher, a commercial product. IDA Free is not supported." },
  prest: { needs: "own-systems", note: "Connects to your own PostgreSQL or MySQL database with the credentials in its configuration." },

  // Sin clasificar: la ficha o el README no dicen qué hace falta para empezar. La nota recoge solo lo que sí está documentado.
  serena: { needs: "unknown", note: "The README describes free, open-source language servers and an optional paid JetBrains plugin with a free trial. What you need to start is not stated." },
  "blender-mcp": { needs: "unknown", note: "The README offers optional AI 3D generation through a paid Premium plan with no key, or with your own provider keys (Meshy needs a paid plan). What the core Blender control needs is not stated." },
  "desktop-commander-mcp": { needs: "unknown", note: "The README calls it free and open source and says it uses your AI client's subscription instead of API costs. Credentials are not described." },
  context7: { needs: "unknown", note: "The README recommends a free API key for higher rate limits. It does not say whether the hosted server works without one." },
  "docker-mcp-gateway": { needs: "unknown", note: "The README says secrets are handled through Docker Desktop. What you need to start is not stated." },
};
