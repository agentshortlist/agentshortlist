import { REASON_TEXT, feedEntries, history, latestDate, nameOf } from "@/lib/history";
import { fmtStars } from "@/lib/data";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Feed Atom: una entrada por registro con cambios reales. Con un solo registro no hay entradas (nada inventado).
export function GET() {
  const entries = feedEntries(30);
  const updated = history[latestDate].verifiedAt;
  const xml =
    `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n` +
    `  <title>${esc(SITE_NAME)}: what changed</title>\n` +
    `  <subtitle>Changes in AI agent rankings, from dated snapshots of public GitHub data.</subtitle>\n` +
    `  <id>${esc(absoluteUrl("/changes/feed.xml"))}</id>\n` +
    `  <link rel="self" type="application/atom+xml" href="${esc(absoluteUrl("/changes/feed.xml"))}"/>\n` +
    `  <link rel="alternate" type="text/html" href="${esc(absoluteUrl("/changes"))}"/>\n` +
    `  <updated>${esc(updated)}</updated>\n  <author><name>${esc(SITE_NAME)}</name></author>\n` +
    entries
      .map((e) => {
        const snap = history[e.date];
        const parts: string[] = [];
        if (e.diff.entered.length) parts.push(`entered: ${e.diff.entered.map((s) => nameOf(s, snap)).join(", ")}`);
        if (e.diff.left.length) parts.push(`left: ${e.diff.left.map((l) => `${nameOf(l.slug, snap)} (${REASON_TEXT[l.reason] ?? l.reason})`).join(", ")}`);
        if (e.diff.licenseChanges.length) parts.push(`license changes: ${e.diff.licenseChanges.map((c) => `${nameOf(c.slug, snap)} ${c.from ?? "not stated"} to ${c.to ?? "not stated"}`).join(", ")}`);
        const top = e.diff.starGains[0];
        if (top) parts.push(`biggest star gain: ${nameOf(top.slug, snap)} ${top.delta > 0 ? "+" : ""}${fmtStars(top.delta)}`);
        if (e.diff.rankMoves.length) parts.push(`${e.diff.rankMoves.length} rank move${e.diff.rankMoves.length === 1 ? "" : "s"} inside categories`);
        return (
          `  <entry>\n    <title>Changes on ${e.date}</title>\n    <id>tag:agentshortlist,${e.date}:changes</id>\n` +
          `    <link rel="alternate" type="text/html" href="${esc(absoluteUrl("/changes"))}"/>\n    <updated>${esc(snap.verifiedAt)}</updated>\n` +
          `    <summary>${esc(`Compared with ${e.prevDate}. ${parts.join("; ")}.`)}</summary>\n  </entry>\n`
        );
      })
      .join("");
  return new Response(xml + `</feed>\n`, { headers: { "Content-Type": "application/atom+xml; charset=utf-8" } });
}
