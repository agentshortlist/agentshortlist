import excluded from "@/data/excluded.json";
import { CATEGORIES, getAgents, getAgentsByCategory, isOpenSource, type Agent } from "@/lib/data";

export type Excluded = { name: string; repo: string; reason: string; daysSincePush: number };
export const EXCLUDED = excluded as Excluded[];

export type LicenseMix = { total: number; osi: number; other: number; notStated: number; osiLabels: { license: string; count: number }[]; notStatedNames: string[]; otherNames: string[] };

// Mezcla de licencias de un conjunto de herramientas, calculada solo con los datos de la API de GitHub.
export function licenseMix(list: Agent[]): LicenseMix {
  const osiList = list.filter(isOpenSource);
  const counts = new Map<string, number>();
  for (const a of osiList) counts.set(a.license!, (counts.get(a.license!) ?? 0) + 1);
  const other = list.filter((a) => a.license && !isOpenSource(a));
  const none = list.filter((a) => !a.license);
  return {
    total: list.length,
    osi: osiList.length,
    other: other.length,
    notStated: none.length,
    osiLabels: [...counts.entries()].map(([license, count]) => ({ license, count })).sort((x, y) => y.count - x.count),
    notStatedNames: none.map((a) => a.name),
    otherNames: other.map((a) => `${a.name} (${a.license})`),
  };
}

export const overallMix = () => licenseMix(getAgents());
export const categoryRows = () => CATEGORIES.map((c) => ({ category: c, mix: licenseMix(getAgentsByCategory(c.slug)) }));
