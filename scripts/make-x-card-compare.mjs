// Tarjeta del comparador para X (1200x675), con datos de las fichas verificadas. Uso: node scripts/make-x-card-compare.mjs
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const COLS = ["Playwright", "Chrome DevTools", "Browser Tools"];
const ROWS = [
  ["Telemetry by default", ["Not verified", "On by default", "Not verified"], 1],
  ["Read-only option", ["None found", "None found", "Not verified"], -1],
  ["Published advisories", ["1 · 0 on latest", "2 · 0 on latest", "0 · 0 on latest"], -1],
  ["Last push", ["2026-10-16", "2026-10-19", "2026-10-16"], -1],
  ["Open issues", ["4 (0 older)", "173 (46 older)", "5 (0 older)"], 1],
];
const X0 = 70, W0 = 290, CW = 260, Y0 = 335, RH = 60;
let t = "";
COLS.forEach((c, i) => (t += `<text x="${X0 + W0 + i * CW}" y="${Y0 - 62}" font-size="26" font-weight="600" fill="#fff">${esc(c)}</text>`));
ROWS.forEach(([label, vals, hot], r) => {
  const y = Y0 + r * RH;
  t += `<line x1="${X0}" x2="1130" y1="${y - 36}" y2="${y - 36}" stroke="#fff" stroke-opacity="0.1"/>`;
  t += `<text x="${X0}" y="${y}" font-size="22" fill="#fff" fill-opacity="0.55">${esc(label)}</text>`;
  vals.forEach((v, i) => {
    const hit = hot === 1 && ((r === 0 && i === 1) || (r === 4 && i === 1));
    t += `<text x="${X0 + W0 + i * CW}" y="${y}" font-size="24" fill="${hit ? "#ffb86b" : "#fff"}" fill-opacity="${hit ? 1 : 0.86}">${esc(v)}</text>`;
  });
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
<rect width="1200" height="675" fill="#0a0a0a"/>
<g font-family="Helvetica Neue, Arial, sans-serif" fill="#fff">
<text x="70" y="84" font-size="26" fill-opacity="0.55">AgentShortlist · Compare</text>
<text x="70" y="150" font-size="44" font-weight="600" letter-spacing="-1">Compare MCP servers before you install.</text>
${t}
<text x="70" y="635" font-size="20" fill-opacity="0.4">Verified cards and OSV.dev advisories, checked 2026-10-19</text>
<text x="1130" y="635" font-size="22" text-anchor="end" fill-opacity="0.6">agentshortlist.dev/compare/live</text>
</g></svg>`;
await sharp(Buffer.from(svg)).png().toFile("docs/brand/cards/x-card-compare-live.png");
console.log("ok");
