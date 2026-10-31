// Artículos del blog que hablan de cada ficha. Solo se muestran los que existen en src/content/blog.
// Sirve para dos cosas: que el lector llegue del dato al análisis y que cada post tenga enlaces internos propios.
export const RELATED_POSTS: Record<string, string[]> = {
  "desktop-commander-mcp": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you"],
  "mcp-reference-servers": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you"],
  "playwright-mcp": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you", "free-mcp-servers-what-free-really-means"],
  "chrome-devtools-mcp": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you"],
  "codebase-memory-mcp": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you", "free-mcp-servers-what-free-really-means"],
  context7: ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you"],
  "excel-mcp-server": ["10-mcp-servers-in-docker-what-their-tool-lists-tell-you", "free-mcp-servers-what-free-really-means"],
  dbhub: ["dbhub-same-tool-list-different-security-status", "20-of-54-mcp-servers-document-a-read-only-mode"],
  "mongodb-mcp-server": ["20-of-54-mcp-servers-document-a-read-only-mode"],
  "mysql-mcp-server": ["20-of-54-mcp-servers-document-a-read-only-mode", "mcp-risk-radar-1-66-advisories-none-on-the-latest-versions"],
  "kubernetes-mcp-server": ["two-kubernetes-mcp-servers-two-kinds-of-safe"],
  "mcp-server-kubernetes": ["two-kubernetes-mcp-servers-two-kinds-of-safe"],
  "exa-mcp-server": ["free-mcp-servers-what-free-really-means"],
  "firecrawl-mcp-server": ["free-mcp-servers-what-free-really-means"],
};
