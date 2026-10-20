// Genera el banner de X (1500x500) con la estética del mapa de señales. Uso: node scripts/make-x-banner.mjs
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");
const W = 1500, H = 500;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hues = [255, 165, 205, 300, 350, 85, 45, 25];
let dots = "";
for (let i = 0; i < 150; i++) {
  const x = 960 + rnd() * 500, y = 40 + Math.pow(rnd(), 0.8) * 400;
  const r = 2.5 + rnd() * 5.5, h = hues[Math.floor(rnd() * hues.length)];
  const fade = Math.min(1, (x - 960) / 200);
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="hsl(${h} 62% 66%)" opacity="${(0.35 + rnd() * 0.55) * fade}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#0a0a0a"/>
<g stroke="#ffffff" stroke-opacity="0.06">${[100, 200, 300, 400].map((y) => `<line x1="0" x2="${W}" y1="${y}" y2="${y}"/>`).join("")}</g>
${dots}
<g font-family="Helvetica Neue, Arial, sans-serif" fill="#fff">
<text x="300" y="215" font-size="68" font-weight="600" letter-spacing="-2">AgentShortlist</text>
<text x="302" y="268" font-size="28" fill="#fff" fill-opacity="0.62">AI agents and MCP servers, ranked by real signals.</text>
<text x="302" y="318" font-size="20" fill="#fff" fill-opacity="0.4">agentshortlist.dev</text>
</g></svg>`;
await sharp(Buffer.from(svg)).png().toFile("docs/brand/agentshortlist-x-banner-1500x500.png");
console.log("ok");
