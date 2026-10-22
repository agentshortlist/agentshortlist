import { isOpenSource, type Agent } from "@/lib/data";

// Dos puntuaciones separadas de la popularidad. Se calculan con reglas simples y se explican en /methodology.
// Salud: ¿se mantiene el proyecto? Riesgo: ¿qué puede salir mal al instalarlo, según lo que hemos leído?
export type Health = { score: number; level: "Strong" | "Fair" | "Weak"; limited: boolean };
export type Risk = { score: number; level: "Low" | "Medium" | "High"; reasons: string[]; limited: boolean };

const DAY = 86_400_000;

export function health(a: Pick<Agent, "lastPush" | "archived" | "license" | "verifiedAt"> & { license: string | null }, asOf = Date.now()): Health {
  const days = a.lastPush ? Math.max(0, (asOf - new Date(a.lastPush).getTime()) / DAY) : null;
  const recency = days === null ? 0 : days <= 14 ? 60 : days <= 30 ? 50 : days <= 90 ? 30 : days <= 180 ? 10 : 0;
  let score = recency + (a.archived ? 0 : 20) + (isOpenSource(a as Agent) ? 20 : a.license ? 10 : 0);
  if (a.archived) score = Math.min(score, 10);
  return { score, level: score >= 75 ? "Strong" : score >= 50 ? "Fair" : "Weak", limited: days === null };
}

type RiskInput = {
  facts: { readOnly: "yes" | "no" | "unknown"; telemetry: "default-on" | "claimed-off" | "unknown" };
  adv: { total: number; latest: number | null; packages: number };
  checks: unknown[];
};

export function risk(c: RiskInput): Risk {
  const reasons: string[] = [];
  let s = 0;
  let unknown = 0;
  if (c.facts.readOnly === "no") { s += 30; reasons.push("No documented read-only option"); }
  else if (c.facts.readOnly === "unknown") { s += 15; unknown++; reasons.push("Read-only option not verified"); }
  if (c.facts.telemetry === "default-on") { s += 15; reasons.push("Sends usage data by default"); }
  else if (c.facts.telemetry === "unknown") { s += 5; unknown++; reasons.push("Telemetry not verified"); }
  if (c.adv.packages === 0) { unknown++; }
  else if ((c.adv.latest ?? 0) > 0) { s += 30; reasons.push("A published advisory affects the latest version"); }
  else if (c.adv.latest === null && c.adv.total > 0) { s += 10; unknown++; reasons.push("Advisories exist; latest version not confirmed"); }
  else if (c.adv.total > 0) { s += 5; reasons.push("Older versions have published advisories: pin the version"); }
  const n = Math.min(c.checks.length, 2);
  if (n) { s += n * 5; reasons.push("Documented safety options are off by default"); }
  const score = Math.min(100, s);
  return { score, level: score < 25 ? "Low" : score < 50 ? "Medium" : "High", reasons, limited: unknown >= 2 };
}
