// Sparkline en SVG puro (sin librerías). Solo se dibuja con datos reales y al menos 3 puntos.
export function Sparkline({
  points,
  label,
  invert = false,
  format = (n: number) => String(n),
}: {
  points: { date: string; value: number }[];
  label: string;
  invert?: boolean; // true: valores menores arriba (p. ej. posición en el ranking)
  format?: (n: number) => string;
}) {
  if (points.length < 3) return null;
  const W = 160;
  const H = 40;
  const pad = 4;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => pad + (i / (points.length - 1)) * (W - pad * 2);
  const y = (v: number) => {
    const t = (v - min) / span;
    return pad + (invert ? t : 1 - t) * (H - pad * 2);
  };
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const text = `${label}: ${format(first.value)} on ${first.date} to ${format(last.value)} on ${last.date}`;
  return (
    <figure className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="h-10 w-40">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-signal" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(points.length - 1)} cy={y(last.value)} r="2.5" className="fill-signal" />
      </svg>
      <figcaption className="mono-num text-[0.6875rem] text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
