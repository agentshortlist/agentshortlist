import raw from "@/content/advisories.json";

export type Vuln = {
  id: string;
  aliases: string[];
  summary: string;
  severity: string | null;
  published: string;
  fixedIn: string[];
  ranges: { introduced?: string; fixed?: string; last_affected?: string }[][];
};
export type PackageAdvisories = {
  ecosystem: string;
  name: string;
  latest: string | null;
  total: number;
  affectingLatest: number | null;
  weeklyDownloads?: number | null;
  vulns: Vuln[];
};
type File = { checkedAt: string; source: string; items: Record<string, PackageAdvisories[]> };

const data = raw as unknown as File;
export const ADVISORIES_CHECKED_AT = data.checkedAt;
export const getAdvisories = (slug: string): PackageAdvisories[] => data.items[slug] ?? [];
export const osvUrl = (id: string) => `https://osv.dev/vulnerability/${id}`;
export const CHECKED_PACKAGES = Object.values(data.items).reduce((n, ps) => n + ps.length, 0);
export const ADVISORIES_TOTAL = Object.values(data.items).flat().reduce((n, p) => n + p.total, 0);
