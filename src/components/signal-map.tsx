import { CATEGORIES, ageDays, getCategory, isOpenSource, rank, type Agent } from "@/lib/data";
import { SignalMapView, type MapPoint } from "@/components/signal-map-view";

// Mapa de señales: cada punto es una herramienta. Eje X = estrellas (escala log), eje Y = días desde el último push.
// El servidor calcula los datos; el cliente solo dibuja, filtra y responde al puntero.
export function SignalMap({ agents }: { agents: Agent[] }) {
  const scores = new Map(rank(agents).map((r) => [r.slug, r.score]));
  const points: MapPoint[] = agents
    .filter((a) => a.stars && a.lastPush && ageDays(a) !== null)
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      category: a.category,
      catName: getCategory(a.category)?.name ?? a.category,
      stars: a.stars!,
      days: Math.round(ageDays(a)! * 10) / 10,
      score: scores.get(a.slug) ?? 0,
      license: isOpenSource(a) ? a.license : null,
      lastPush: a.lastPush!,
    }));
  return <SignalMapView points={points} cats={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))} />;
}
