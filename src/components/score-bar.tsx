import type { ScoreParts } from "@/lib/data";

// Barra apilada: estrellas (acento), actividad y licencia. Cada tramo es proporcional a sus puntos reales.
export function ScoreBar({ score, parts, wide = false }: { score: number; parts: ScoreParts; wide?: boolean }) {
  const label = `Score ${score} of 100: stars ${Math.round(parts.stars)}, activity ${Math.round(parts.recency)}, license ${Math.round(parts.license)}`;
  return (
    <div className="flex items-center gap-3" role="img" aria-label={label} title={label}>
      <span className="mono-num w-8 text-right text-sm">{score}</span>
      <span className={`flex h-1.5 overflow-hidden rounded-full bg-ink/[0.07] ${wide ? "w-40" : "w-24"}`}>
        <span className="h-full bg-signal" style={{ width: `${parts.stars}%` }} />
        <span className="h-full bg-ink/70" style={{ width: `${parts.recency}%` }} />
        <span className="h-full bg-ink/30" style={{ width: `${parts.license}%` }} />
      </span>
    </div>
  );
}

export function ScoreLegend() {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
      <span className="inline-flex items-center gap-2"><i className="inline-block size-2 rounded-full bg-signal" />Stars · 50</span>
      <span className="inline-flex items-center gap-2"><i className="inline-block size-2 rounded-full bg-ink/70" />Activity · 30</span>
      <span className="inline-flex items-center gap-2"><i className="inline-block size-2 rounded-full bg-ink/30" />License · 20</span>
    </p>
  );
}
