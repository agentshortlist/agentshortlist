// Logo (300x300) y banner (1584x396) para la página de empresa de LinkedIn. Uso: node scripts/make-linkedin-assets.mjs
import { createRequire } from "node:module";
const sharp = createRequire(import.meta.url)("sharp");

// Logo: el icono de la marca a 300x300 (PNG).
await sharp("docs/brand/agentshortlist-icon-512.png").resize(300, 300).png().toFile("docs/brand/linkedin/agentshortlist-logo-300.png");

// Banner: mismos puntos de colores que el de X, con el texto desplazado a la derecha porque el logo de la página
// tapa la esquina inferior izquierda.
let seed = 23;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hues = [255, 165, 205, 300, 350, 85, 45, 25];
let dots = "";
for (let i = 0; i < 120; i++) {
  const x = 1080 + rnd() * 480, y = 20 + rnd() * 356, r = 2.5 + rnd() * 5.5, h = hues[Math.floor(rnd() * hues.length)];
  const fade = Math.min(1, (x - 1080) / 160);
  dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="hsl(${h} 62% 66%)" opacity="${((0.35 + rnd() * 0.55) * fade).toFixed(2)}"/>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1584" height="396" viewBox="0 0 1584 396">
<rect width="1584" height="396" fill="#0a0a0a"/>${dots}
<g font-family="Helvetica Neue, Arial, sans-serif" fill="#fff">
<text x="420" y="168" font-size="64" font-weight="600" letter-spacing="-2">AgentShortlist</text>
<text x="422" y="224" font-size="28" fill-opacity="0.65">Evidence you can check before you install an MCP server.</text>
<text x="422" y="272" font-size="22" fill-opacity="0.4">agentshortlist.dev</text>
</g></svg>`;
await sharp(Buffer.from(svg)).png().toFile("docs/brand/linkedin/agentshortlist-banner-1584x396.png");
console.log("ok");
