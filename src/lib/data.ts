import raw from "@/data/agents.json";

export type Agent = {
  name: string;
  slug: string;
  category: string;
  description: string | null;
  officialUrl: string | null;
  repoUrl: string;
  license: string | null;
  pricingModel: string | null;
  stars: number | null;
  lastPush: string | null;
  archived: boolean;
  sources: string[];
  verifiedAt: string;
};

export type Category = { slug: string; name: string; noun: string; blurb: string };

export const CATEGORIES: Category[] = [
  {
    slug: "coding-agents",
    name: "Coding Agents",
    noun: "AI coding agents",
    blurb: "Agents that read, write and change code in your terminal, IDE or repository.",
  },
  {
    slug: "mcp-servers",
    name: "MCP Servers",
    noun: "MCP servers",
    blurb: "Model Context Protocol servers that give agents access to tools, documentation and services.",
  },
  {
    slug: "mcp-database-servers",
    name: "MCP Database Servers",
    noun: "MCP servers for databases",
    blurb: "MCP servers and data APIs that let agents query and work with databases.",
  },
  {
    slug: "multi-agent-frameworks",
    name: "Multi-Agent Frameworks",
    noun: "multi-agent frameworks",
    blurb: "Frameworks for building and orchestrating several cooperating agents.",
  },
  {
    slug: "agent-frameworks",
    name: "Agent Frameworks",
    noun: "AI agent frameworks",
    blurb: "Libraries and frameworks for building AI agents and agent workflows.",
  },
  {
    slug: "research-agents",
    name: "Research Agents",
    noun: "AI research agents",
    blurb: "Agents that search, read and synthesize sources into research output.",
  },
  {
    slug: "browser-agents",
    name: "Browser and Computer-Use Agents",
    noun: "browser and computer-use agents",
    blurb: "Agents that operate a browser or a computer interface on your behalf.",
  },
  {
    slug: "ops-agents",
    name: "SRE and Ops Agents",
    noun: "AI SRE and ops agents",
    blurb: "Agents that investigate incidents and help operate infrastructure.",
  },
  {
    slug: "personal-agents",
    name: "Personal Agents",
    noun: "open-source personal AI agents",
    blurb: "General-purpose personal agents you can run and extend yourself.",
  },
];

export type BestPage = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  noun: string;
  audience: string;
  select: { categories: string[]; openSourceOnly?: boolean };
  related: [string, string];
};

const page = (
  slug: string,
  h1: string,
  noun: string,
  audience: string,
  select: BestPage["select"],
  related: [string, string],
): BestPage => ({
  slug,
  h1,
  title: `${h1} (Ranked by Real Signals)`,
  description: `${h1}, ranked by GitHub stars, recent activity and license openness. Updated from live GitHub data.`,
  noun,
  audience,
  select,
  related,
});

export const BEST_PAGES: BestPage[] = [
  page("coding", "Best AI Agents for Coding", "AI coding agents", "developers who want an agent that works directly on a codebase", { categories: ["coding-agents"] }, ["open-source-coding-agents", "mcp-servers-for-developers"]),
  page("mcp-servers-for-developers", "Best MCP Servers for Developers", "MCP servers", "developers connecting agents to documentation, repositories and browsers", { categories: ["mcp-servers"] }, ["mcp-servers-for-databases", "coding"]),
  page("multi-agent-orchestration", "Best Multi-Agent Frameworks", "multi-agent frameworks", "teams building systems where several agents cooperate", { categories: ["multi-agent-frameworks"] }, ["ai-agent-frameworks", "research"]),
  page("research", "Best AI Research Agents", "AI research agents", "people who need an agent to search, read and synthesize sources", { categories: ["research-agents"] }, ["browser-automation", "ai-agent-frameworks"]),
  page("browser-automation", "Best AI Browser and Computer-Use Agents", "browser and computer-use agents", "teams automating work that happens in a browser or on a desktop", { categories: ["browser-agents"] }, ["research", "personal-agents"]),
  page("mcp-servers-for-databases", "Best MCP Servers for Databases", "MCP servers for databases", "developers giving agents controlled access to databases", { categories: ["mcp-database-servers"] }, ["mcp-servers-for-developers", "coding"]),
  page("ai-agent-frameworks", "Best AI Agent Frameworks", "AI agent frameworks", "developers choosing a framework to build agents on", { categories: ["agent-frameworks"] }, ["multi-agent-orchestration", "coding"]),
  page("open-source-coding-agents", "Best Open-Source AI Coding Agents", "open-source AI coding agents", "developers who want an agent with an open-source license", { categories: ["coding-agents"], openSourceOnly: true }, ["coding", "mcp-servers-for-developers"]),
  page("ai-sre-agents", "Best AI SRE and Ops Agents", "AI SRE and ops agents", "platform and on-call teams investigating incidents with agents", { categories: ["ops-agents"] }, ["multi-agent-orchestration", "browser-automation"]),
  page("personal-agents", "Best Open-Source Personal AI Agents", "open-source personal AI agents", "people who want a general-purpose agent they can run themselves", { categories: ["personal-agents"], openSourceOnly: true }, ["browser-automation", "research"]),
];

const OSI = new Set(["MIT", "Apache-2.0", "BSD-3-Clause", "BSD-2-Clause", "GPL-3.0", "AGPL-3.0", "MPL-2.0", "ISC"]);

const agents = raw as Agent[];

export const getAgents = () => agents;
export const getAgent = (slug: string) => agents.find((a) => a.slug === slug);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const getAgentsByCategory = (slug: string) => agents.filter((a) => a.category === slug);
export const getBestPage = (slug: string) => BEST_PAGES.find((b) => b.slug === slug);

export const isOpenSource = (a: Agent) => !!a.license && OSI.has(a.license);

export const agentsForPage = (p: BestPage) =>
  agents.filter((a) => p.select.categories.includes(a.category) && (!p.select.openSourceOnly || isOpenSource(a)));

export const pagesForAgent = (a: Agent) =>
  BEST_PAGES.filter((p) => p.select.categories.includes(a.category) && (!p.select.openSourceOnly || isOpenSource(a)));

export const ageDays = (a: Agent) =>
  a.lastPush ? Math.max(0, (new Date(a.verifiedAt).getTime() - new Date(a.lastPush).getTime()) / 86_400_000) : null;

export type Freshness = "fresh" | "active";
export const freshness = (a: Agent): Freshness => ((ageDays(a) ?? 999) <= 30 ? "fresh" : "active");

export const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : "not available");
export const fmtStars = (n: number | null) => (n === null ? "n/a" : n.toLocaleString("en-US"));

export const WEIGHTS = { stars: 50, recency: 30, license: 20 } as const;
export const RECENCY_WINDOW_DAYS = 90;

export type ScoreParts = { stars: number; recency: number; license: number };
export type Ranked = Agent & { score: number; parts: ScoreParts };

// Puntuación 0-100 relativa al conjunto: estrellas (escala log), recencia del último push y licencia abierta.
export function rank(list: Agent[]): Ranked[] {
  const maxLog = Math.log(Math.max(1, ...list.map((a) => a.stars ?? 0)) + 1);
  return list
    .map((a) => {
      const stars = a.stars !== null && maxLog > 0 ? Math.log(a.stars + 1) / maxLog : 0;
      const age = ageDays(a);
      const recency = age === null ? 0 : Math.max(0, 1 - age / RECENCY_WINDOW_DAYS);
      const license = isOpenSource(a) ? 1 : 0;
      const parts = {
        stars: WEIGHTS.stars * stars,
        recency: WEIGHTS.recency * recency,
        license: WEIGHTS.license * license,
      };
      const score = Math.round(parts.stars + parts.recency + parts.license);
      return { ...a, score, parts };
    })
    .sort((x, y) => y.score - x.score || (y.stars ?? 0) - (x.stars ?? 0));
}

const list = (names: string[]) =>
  names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

export function bestPageContent(p: BestPage) {
  const ranked = rank(agentsForPage(p));
  const top = ranked[0];
  const open = ranked.filter(isOpenSource);
  const notOpen = ranked.filter((a) => !isOpenSource(a));
  const updated = ranked.map((a) => a.verifiedAt).sort().at(-1)!;
  const noun = p.noun;

  const summary =
    `${top.name} ranks first among ${ranked.length} tracked ${noun} on AgentShortlist, with ` +
    `${fmtStars(top.stars)} GitHub stars and a push on ${fmtDate(top.lastPush)}. ` +
    `${open.length} of ${ranked.length} use an open-source license. ` +
    `Rankings combine stars, recent activity and license openness.`;

  // Solo hechos presentes en los datos: nada de afirmaciones de calidad ni de funcionalidades.
  const byStars = [...ranked].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))[0];
  const byRecent = [...ranked].sort((a, b) => (b.lastPush ?? "").localeCompare(a.lastPush ?? ""))[0];
  const who = [
    { label: "Highest overall score", text: `${top.name} (${top.score}/100).` },
    { label: "Most GitHub stars", text: `${byStars.name} (${fmtStars(byStars.stars)}).` },
    { label: "Most recently pushed", text: `${byRecent.name} (${fmtDate(byRecent.lastPush)}).` },
    {
      label: "If the license matters to you",
      text:
        `${list(open.map((a) => `${a.name} (${a.license})`))} list an open-source license on GitHub.` +
        (notOpen.length ? ` For ${list(notOpen.map((a) => a.name))}, check the project's own terms.` : ""),
    },
  ];

  const faq = [
    {
      q: `What is the top-ranked option among ${noun}?`,
      a: `By AgentShortlist's signal-based ranking, ${top.name} ranks first (score ${top.score}/100, ${fmtStars(top.stars)} GitHub stars, last push ${fmtDate(top.lastPush)}). The ranking measures popularity, recent maintenance and license openness. It does not measure output quality for your specific task, so shortlist two or three and test them on your own work.`,
    },
    {
      q: `Which of these ${noun} are open source?`,
      a:
        `${list(open.map((a) => `${a.name} (${a.license})`))} ${open.length === 1 ? "has" : "have"} an open-source license listed on GitHub.` +
        (notOpen.length
          ? ` ${list(notOpen.map((a) => a.name))} ${notOpen.length === 1 ? "has" : "have"} no standard open-source license detected by GitHub; check the project's own terms.`
          : ""),
    },
    {
      q: `How does AgentShortlist rank ${noun}?`,
      a: `Each tool gets a score out of 100: ${WEIGHTS.stars} points for GitHub stars (log-scaled against the strongest tool in this list), ${WEIGHTS.recency} for how recently the repository was pushed (full marks for today, zero at ${RECENCY_WINDOW_DAYS} days), and ${WEIGHTS.license} for an open-source license. Only repositories that are not archived and were pushed within ${RECENCY_WINDOW_DAYS} days are listed. Sponsorship never changes the order.`,
    },
    {
      q: "How often is this page updated?",
      a: `All figures come from the public GitHub API. This page was last verified on ${fmtDate(updated)}.`,
    },
  ];

  return { noun, ranked, top, open, summary, who, faq, updated };
}

// Regla de publicación: una página /best/ solo existe si al menos 3 herramientas pasan la regla de curación.
for (const p of BEST_PAGES) {
  const n = agentsForPage(p).length;
  if (n < 3) throw new Error(`/best/${p.slug} has only ${n} qualifying tools (minimum 3)`);
}
