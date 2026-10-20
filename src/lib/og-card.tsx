import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Pseudoaleatorio estable a partir de un texto: cada página obtiene su propio dibujo de puntos, siempre el mismo.
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Imagen para compartir (Open Graph) con el título de cada página, en el estilo de la marca.
export function ogCard({ eyebrow, title, sub, seed }: { eyebrow: string; title: string; sub?: string; seed: string }) {
  const r = rng(seed);
  const fs = title.length > 74 ? 54 : title.length > 52 ? 64 : title.length > 34 ? 76 : 92;
  const dots = Array.from({ length: 46 }, () => {
    const x = 640 + r() * 520;
    const fade = Math.min(1, (x - 640) / 200);
    return { x, y: 30 + r() * 570, s: 6 + r() * 14, h: Math.floor(r() * 360), a: (0.25 + r() * 0.5) * fade };
  });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0a", color: "#fafafa" }}>
        {dots.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.s, height: d.s, borderRadius: 999, background: `hsl(${d.h} 60% 66%)`, opacity: d.a }} />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%", height: "100%" }}>
          <div style={{ display: "flex", fontSize: 30, opacity: 0.6 }}>{`AgentShortlist · ${eyebrow}`}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: fs, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2, maxWidth: 980 }}>{title}</div>
            {sub ? <div style={{ display: "flex", fontSize: 30, opacity: 0.65, marginTop: 28, maxWidth: 900 }}>{sub}</div> : null}
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.45 }}>agentshortlist.dev</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
