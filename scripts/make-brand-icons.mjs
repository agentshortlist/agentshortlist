// Genera los iconos de marca (concepto 3: monograma A con punto azul) a partir de un único SVG.
//   src/app/favicon.ico (16, 32, 48 y 256 px), docs/brand/*.png (icono 512 y perfil de X 800).
// Las rutas /icon y /apple-icon se dibujan en src/app/icon.tsx y src/app/apple-icon.tsx con el mismo trazado.
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
const sharp = createRequire(import.meta.url)("sharp");

const BG = "#0a0a0a", INK = "#fafafa", SIG = "#7c9cff";
export const MARK = `<path d="M15 51 L32 17 L49 51" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23.5 39 H40.5" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
<circle cx="32" cy="14" r="7.5" fill="${SIG}"/>`;
const svg = (rounded) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" ${rounded ? 'rx="14" ' : ""}fill="${BG}"/>${MARK}</svg>`);
const png = (rounded, s) => sharp(svg(rounded), { density: 72 * (s / 64) * 2 }).resize(s, s).png().toBuffer();

const sizes = [16, 32, 48, 256];
const imgs = await Promise.all(sizes.map((s) => png(true, s)));
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s === 256 ? 0 : s; e[1] = s === 256 ? 0 : s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(imgs[i].length, 8); e.writeUInt32LE(off, 12); off += imgs[i].length; return e;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([head, ...dir, ...imgs]));
mkdirSync("docs/brand", { recursive: true });
writeFileSync("docs/brand/agentshortlist-icon-512.png", await png(true, 512));
writeFileSync("docs/brand/agentshortlist-x-profile-800.png", await png(false, 800)); // cuadrado sin esquinas: X lo recorta en círculo
console.log("iconos generados");
