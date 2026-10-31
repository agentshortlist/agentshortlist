import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { TESTS } from "@/content/tests";
import { fmtDate } from "@/lib/data";
import { CORRECTIONS_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open data: MCP server test records",
  description: "Every MCP server start we recorded, as JSON and CSV: exact version, environment, tool count and sha256 of the tool list. Free to reuse with credit.",
  alternates: { canonical: "/data" },
};

const FIELDS: [string, string][] = [
  ["slug", "The card on this site the record belongs to."],
  ["testedAt", "Day we ran the start (YYYY-MM-DD)."],
  ["package", "Exact package and version that was started."],
  ["command", "The start command, with its flags, as launched."],
  ["environment", "Where it ran, for example a Docker image with no credentials and synthetic data."],
  ["protocol.era", "Whether the server answered the 2026-07-28 revision (server/discover) or only the earlier handshake (initialize)."],
  ["toolsList.count", "How many tools the server listed."],
  ["hashes", "sha256 of the canonical tool list: descriptions, schemas, and both together. Same hash, same list."],
  ["notes", "What we saw that the other fields do not say."],
];

export default function DataPage() {
  const servers = new Set(TESTS.map((t) => t.slug)).size;
  const latest = TESTS.map((t) => t.testedAt).sort().at(-1)!;
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Open data</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Every MCP server start we recorded, as data.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          {TESTS.length} records for {servers} servers, the latest from {fmtDate(latest)}. Each one says which version we started, in what
          environment, what it listed and the hash of that list. A pass means the server started and listed its tools. It does not
          mean it is safe.
        </p>
      </header>

      <section aria-labelledby="download" className="section space-y-5 ">
        <h2 id="download" className="display-2 fs-title">Download</h2>
        <ul className="prose-measure space-y-2 text-foreground/85">
          <li><a href="/data/mcp-tests.json" className="underline underline-offset-4">mcp-tests.json</a>: all fields, including the tool names.</li>
          <li><a href="/data/mcp-tests.csv" className="underline underline-offset-4">mcp-tests.csv</a>: one row per record, without the tool names.</li>
        </ul>
        <p className="prose-measure text-foreground/85">
          Free to reuse under CC BY 4.0: credit AgentShortlist and link to this page. The scripts that produce the records are in
          the <a href="https://github.com/agentshortlist/agentshortlist" className="underline underline-offset-4">public repository</a>,
          and the method is on the <Link href="/methodology" className="underline underline-offset-4">methodology page</Link>.
        </p>
      </section>

      <section aria-labelledby="fields" className="section space-y-5 ">
        <h2 id="fields" className="display-2 fs-title">What each field means</h2>
        <dl className="prose-measure space-y-3 text-sm">
          {FIELDS.map(([k, d]) => (
            <div key={k}>
              <dt className="mono-num">{k}</dt>
              <dd className="text-foreground/85">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="limits" className="section space-y-5 ">
        <h2 id="limits" className="display-2 fs-title">Limits</h2>
        <ul className="prose-measure list-disc space-y-2 pl-5 text-foreground/85">
          <li>Only servers we started ourselves appear here. A card with no record says &ldquo;Tested by us: Not yet&rdquo;.</li>
          <li>One environment per record. A different operating system, client or flag can give a different list.</li>
          <li>Tool lists are a record of what the server announced, not of what it does when called.</li>
        </ul>
        <p className="prose-measure text-foreground/85">
          Found a mistake? Write to <a href={`mailto:${CORRECTIONS_EMAIL}`} className="underline underline-offset-4">{CORRECTIONS_EMAIL}</a> and we will correct the record and say so.
        </p>
      </section>
    </div>
  );
}
