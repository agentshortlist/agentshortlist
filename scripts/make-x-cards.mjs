// Tarjetas de imagen para posts de X (1200x675). Uso: node scripts/make-x-cards.mjs
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const CARDS = [
  { f: "playwright", big: ["Playwright's own README", "recommends its CLI"], sub: ["For coding agents, to avoid loading large tool", "schemas and page snapshots into context."], src: "microsoft/playwright-mcp README, checked 2026-10-18" },
  { f: "desktop-commander", big: ["Guardrails,", "not a sandbox."], sub: ["How Desktop Commander's security policy", "describes its own restrictions. Real isolation: Docker or a VM."], src: "DesktopCommanderMCP SECURITY.md, checked 2026-10-18" },
  { f: "mysql", big: ["execute_sql accepts", "INSERT, UPDATE, DELETE"], sub: ["Autocommit on, and we found no read-only mode.", "Use a database user that can only SELECT."], src: "designcomputer/mysql_mcp_server source, checked 2026-10-18" },
  { f: "chrome-devtools", big: ["On by default:", "usage stats to Google"], sub: ["Opt out with --no-usage-statistics", "and --no-performance-crux."], src: "ChromeDevTools/chrome-devtools-mcp README, checked 2026-10-19" },
  { f: "aws", big: ["AWS points to", "a successor"], sub: ["The awslabs/mcp README recommends the Agent Toolkit", "for AWS for production software built with coding agents."], src: "awslabs/mcp README, checked 2026-10-19" },
];
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hues = [255, 165, 205, 300, 350, 85, 45, 25];
for (const c of CARDS) {
  let dots = "";
  for (let i = 0; i < 70; i++) {
    const x = 760 + rnd() * 420, y = 30 + rnd() * 610, r = 2 + rnd() * 5;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="hsl(${hues[Math.floor(rnd() * 8)]} 62% 66%)" opacity="${(0.25 + rnd() * 0.5) * Math.min(1, (x - 760) / 160)}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<rect width="1200" height="675" fill="#0a0a0a"/>${dots}
<g font-family="Helvetica Neue, Arial, sans-serif" fill="#fff">
<text x="70" y="90" font-size="26" fill-opacity="0.55">AgentShortlist</text>
<text x="70" y="255" font-size="66" font-weight="600" letter-spacing="-2">${esc(c.big[0])}</text>
<text x="70" y="335" font-size="66" font-weight="600" letter-spacing="-2">${esc(c.big[1])}</text>
<text x="70" y="425" font-size="28" fill-opacity="0.72">${esc(c.sub[0])}</text>
<text x="70" y="465" font-size="28" fill-opacity="0.72">${esc(c.sub[1])}</text>
<text x="70" y="610" font-size="20" fill-opacity="0.4">${esc(c.src)}</text>
<text x="1130" y="610" font-size="22" text-anchor="end" fill-opacity="0.6">agentshortlist.dev</text>
</g></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`docs/brand/cards/x-card-${c.f}.png`);
}
console.log("ok", CARDS.length);
