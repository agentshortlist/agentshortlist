import { TESTS } from "@/content/tests";

export const dynamic = "force-static";

const COLUMNS = [
  "slug", "testedAt", "package", "client", "os", "environment", "command", "era", "install", "handshake",
  "toolsListStatus", "toolsCount", "hashDescriptions", "hashSchemas", "hashAll", "notes",
] as const;

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function GET() {
  const rows = TESTS.map((t) => [
    t.slug, t.testedAt, t.package, t.client, t.os, t.environment, t.command, t.protocol?.era,
    t.install, t.handshake, t.toolsList.status, t.toolsList.count,
    t.hashes?.descriptions, t.hashes?.schemas, t.hashes?.all, t.notes,
  ]);
  const csv = [COLUMNS.join(","), ...rows.map((r) => r.map(cell).join(","))].join("\n") + "\n";
  return new Response(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
