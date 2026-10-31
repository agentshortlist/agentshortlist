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

const FLAGS: { slug: string; name: string; setting: string; without: number; withIt: number; note: string }[] = [
  { slug: "mongodb-mcp-server", name: "MongoDB MCP Server 3.1.0", setting: "--readOnly", without: 27, withIt: 18, note: "Runs on 25 and 26 October." },
  { slug: "grafana-mcp-server", name: "Grafana MCP Server 2.1.1", setting: "--disable-write", without: 79, withIt: 62, note: "Seventeen create, update and delete tools no longer listed." },
  { slug: "blender-mcp", name: "Blender MCP 2.2.4", setting: "BLENDER_MCP_SAFE_MODE=1", without: 9, withIt: 9, note: "Same list. The setting does not show in tools/list." },
  { slug: "clickhouse-mcp-server", name: "ClickHouse MCP Server 0.7.0", setting: "CLICKHOUSE_ALLOW_WRITE_ACCESS", without: 3, withIt: 3, note: "Same list with write access on and off." },
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

      <section aria-labelledby="flags" className="section space-y-5 ">
        <h2 id="flags" className="display-2 fs-title">Settings that change the tool list, and settings that do not</h2>
        <p className="prose-measure text-foreground/85">
          Some servers hide their write tools when you start them with a read-only setting. Others enforce the limit inside the code, where
          the list does not show it. These are the four we ran with and without the setting. Each count comes from a record above.
        </p>
        <div className="surface-lg overflow-x-auto p-2 sm:p-3">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">Tools listed with and without a read-only or safe setting</caption>
            <thead>
              <tr className="border-b border-ink/[0.09]">
                <th scope="col" className="px-3 py-3 text-left font-medium">Server</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">Setting</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Without</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">With</th>
                <th scope="col" className="px-3 py-3 text-left font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {FLAGS.map((f) => (
                <tr key={f.slug} className="border-b border-ink/[0.05] last:border-0">
                  <td className="px-3 py-3"><Link href={`/agents/${f.slug}`} className="hover:underline">{f.name}</Link></td>
                  <td className="mono-num px-3 py-3">{f.setting}</td>
                  <td className="mono-num px-3 py-3 text-right">{f.without}</td>
                  <td className="mono-num px-3 py-3 text-right">{f.withIt}</td>
                  <td className="px-3 py-3 text-muted-foreground">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="prose-measure text-sm text-muted-foreground">
          A list that does not change does not mean the limit is missing: it may live elsewhere. A list that shrinks does not prove nothing can
          be written. We did not call write tools in any of these runs.
        </p>
      </section>

      <section aria-labelledby="repeat" className="section space-y-5 ">
        <h2 id="repeat" className="display-2 fs-title">Repeat a run</h2>
        <p className="prose-measure text-foreground/85">
          Each record has the exact start command. To repeat a run, get <code>scripts/mcp-probe.mjs</code> from the public repository, put it in a
          folder and run it inside Docker with the limits we used from the second run on 25 October. Put the record&apos;s start command after the two dashes.
          Servers that need an environment variable get a filler value: the records list the variable names, never the values.
        </p>
        <pre className="surface overflow-x-auto p-4 text-xs leading-[1.7]"><code>{`docker run --rm --hostname=probe-host --memory=3g --cpus=2 --pids-limit=1024 \\
  --security-opt=no-new-privileges -v "$PWD:/work" -w /work node:22-slim \\
  node scripts/mcp-probe.mjs --slug=<card> --package=<package@version> --timeout=90 -- <start command>`}</code></pre>
        <p className="prose-measure text-sm text-muted-foreground">
          For Python servers we used the <code>ghcr.io/astral-sh/uv:python3.12-bookworm-slim</code> image, with Node and git installed first to run the script.
          The first ten records (first run, 25 October) did not set the hostname or the limits, so they can differ in the hostname text some servers write into
          their descriptions. Compare hashes taken in the same environment.
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
