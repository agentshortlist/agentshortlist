import excluded from "@/data/excluded.json";
import { fmtDate, fmtStars, getAgents, isOpenSource, rank } from "@/lib/data";

export type Fact = { key: string; label: string; value: string; href?: string };

// Datos del ticker: todo se calcula a partir de agents.json y excluded.json, sin cifras escritas a mano.
export function tickerFacts(): Fact[] {
  const all = getAgents();
  const ranked = rank(all);
  const top = ranked[0];
  const byStars = [...all].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))[0];
  const byPush = [...all].sort((a, b) => (b.lastPush ?? "").localeCompare(a.lastPush ?? ""))[0];
  const verified = all.map((a) => a.verifiedAt).sort().at(-1)!;
  const open = all.filter(isOpenSource).length;
  const inactive = (excluded as { name: string; reason: string; daysSincePush: number }[]).filter((e) => e.reason === "inactive");

  const facts: Fact[] = [
    { key: "tools", label: "Tools tracked", value: String(all.length) },
    { key: "open", label: "With an open-source license", value: `${open} of ${all.length}` },
    { key: "top", label: "Top score", value: `${top.name} · ${top.score}/100`, href: `/agents/${top.slug}` },
    { key: "stars", label: "Most stars", value: `${byStars.name} · ${fmtStars(byStars.stars)}`, href: `/agents/${byStars.slug}` },
    { key: "push", label: "Latest push", value: `${byPush.name} · ${fmtDate(byPush.lastPush)}`, href: `/agents/${byPush.slug}` },
  ];
  if (inactive.length) {
    facts.push({
      key: "left-out",
      label: "Left out by the 90-day rule",
      value: inactive.map((e) => `${e.name} (${e.daysSincePush}d)`).join(", "),
    });
  }
  facts.push({ key: "policy", label: "Sponsorship", value: "never changes the order", href: "/methodology" });
  facts.push({ key: "verified", label: "Data checked", value: fmtDate(verified) });
  return facts;
}
