export const SITE_NAME = "AgentShortlist";
// Dominio definitivo. NEXT_PUBLIC_SITE_URL solo hace falta para probar con otra URL (p. ej. un despliegue de prueba).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentshortlist.dev").replace(/\/$/, "");
export const SITE_TAGLINE = "A curated, signal-ranked directory of AI agents, coding agents and MCP servers.";

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

// Canal público de correcciones: buzón del dominio (Plesk), no una dirección personal.
export const CORRECTIONS_EMAIL = "hi@agentshortlist.dev";

// Imagen para redes y buscadores; las páginas que definen su propio openGraph deben incluirla (no se hereda).
export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "AgentShortlist: best AI agents, ranked by real signals" };

// Primer título que cabe junto al sufijo " | AgentShortlist" sin pasar de ~60 caracteres.
export const fitTitle = (candidates: string[], max = 44) => candidates.find((t) => t.length <= max) ?? candidates[candidates.length - 1];

// Recorta una meta description a ~155 caracteres sin partir palabras.
export const clip = (s: string, max = 155) => {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,.;:\-–—(]+$/, "") + "…";
};

export const X_URL = "https://x.com/agentshortlist";
export const GITHUB_URL = "https://github.com/agentshortlist/agentshortlist";
export const GITHUB_ORG_URL = "https://github.com/agentshortlist";
export const BLUESKY_URL = "https://bsky.app/profile/agentshortlist.dev";
export const LINKEDIN_URL = "https://www.linkedin.com/company/agentshortlist/";

// Google Analytics 4. El identificador no es un secreto. La etiqueta solo se carga si el lector acepta (ver privacy-notice.tsx).
export const GA_ID = "G-6HN9QJSR5K";

// Autor del sitio. La biografía se usa en /about, en el pie de cada artículo y en los datos estructurados.
export const AUTHOR_NAME = "Antonio GM";
export const AUTHOR_BIO =
  "Antonio GM is a senior software developer and SEO expert with 13 years of experience building and growing websites. He now focuses on MCP and AI agents, exploring how they can make information and digital tools more accessible and useful.";
