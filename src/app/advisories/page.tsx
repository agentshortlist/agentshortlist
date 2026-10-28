import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { JsonLd, breadcrumbLd } from "@/components/json-ld";
import { ADVISORIES_CHECKED_AT, allAdvisories, osvUrl, type PackageAdvisories, type Vuln } from "@/lib/advisories";
import { fmtDate, getAgent } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

type Entry = { slug: string; name: string; pkg: PackageAdvisories; v: Vuln };

const rows = allAdvisories()
  .map(([slug, pkgs]) => ({ slug, name: getAgent(slug)?.name ?? slug, pkgs }))
  .filter((r) => r.pkgs.length > 0);
const withAdvisories = rows.filter((r) => r.pkgs.some((p) => p.total > 0));
const withNone = rows.filter((r) => r.pkgs.every((p) => p.total === 0));
const allPkgs = rows.flatMap((r) => r.pkgs);
const total = allPkgs.reduce((n, p) => n + p.total, 0);
const checkable = allPkgs.filter((p) => p.affectingLatest !== null);
const affectLatest = checkable.filter((p) => (p.affectingLatest ?? 0) > 0);
const newest: Entry[] = withAdvisories
  .flatMap((r) => r.pkgs.flatMap((pkg) => pkg.vulns.map((v) => ({ slug: r.slug, name: r.name, pkg, v }))))
  .sort((a, b) => b.v.published.localeCompare(a.v.published) || a.name.localeCompare(b.name))
  .slice(0, 12);

export const metadata: Metadata = {
  title: "MCP server security advisories, by server",
  description: `Published security advisories (OSV.dev) for the packages of ${rows.length} MCP servers we have read: what was reported, which version fixes it and whether the latest version is affected.`,
  alternates: { canonical: "/advisories" },
};

const link = "underline underline-offset-4 hover:text-foreground";

function VulnLine({ v }: { v: Vuln }) {
  return (
    <li className="text-sm leading-[1.55]">
      <a href={osvUrl(v.id)} target="_blank" rel="noopener noreferrer" className={`mono-num ${link}`}>{v.id}</a>
      {v.severity ? <span className="text-muted-foreground"> · {v.severity.toLowerCase()}</span> : null}
      <span className="text-muted-foreground"> · {fmtDate(v.published)}</span>
      {v.fixedIn.length > 0 ? <span className="text-muted-foreground"> · fixed in {v.fixedIn.join(", ")}</span> : null}
      <span className="block text-foreground/85">{v.summary}</span>
    </li>
  );
}

export default function AdvisoriesPage() {
  return (
    <div>
      <JsonLd data={breadcrumbLd([{ name: "Home", url: absoluteUrl("/") }, { name: "Advisories", url: absoluteUrl("/advisories") }])} />
      <header className="space-y-6">
        <Eyebrow>Security</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Security advisories for MCP servers.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Every published advisory that OSV.dev lists for the packages of the MCP servers we have read, checked on {fmtDate(ADVISORIES_CHECKED_AT)}.
          {" "}{total} advisories across {allPkgs.length} packages from {rows.length} servers.
          {checkable.length > 0 ? ` Of the ${checkable.length} packages where we could compare against the latest release, ${affectLatest.length === 0 ? "none is" : `${affectLatest.length} ${affectLatest.length === 1 ? "is" : "are"}`} affected by an advisory in its latest version.` : ""}
        </p>
        <p className="prose-measure max-w-[42rem] text-sm leading-[1.6] text-muted-foreground">
          These are reports written by others, and we did not test them. No advisory listed does not mean a package is safe: it means nobody has reported one that OSV lists.
          How we match servers to packages is on the <Link href="/methodology" className={link}>methodology page</Link>.
        </p>
      </header>

      <section className="section space-y-6">
        <h2 className="display-2 text-xl sm:text-2xl">Newest advisories</h2>
        <ul className="divide-y divide-ink/10">
          {newest.map(({ slug, name, pkg, v }) => (
            <li key={`${slug}:${v.id}`} className="space-y-1 py-4 first:pt-0">
              <p className="text-sm">
                <Link href={`/agents/${slug}`} className={`font-medium ${link}`}>{name}</Link>
                <span className="text-muted-foreground"> · <span className="mono-num">{pkg.name}</span></span>
              </p>
              <ul><VulnLine v={v} /></ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="section space-y-8">
        <h2 className="display-2 text-xl sm:text-2xl">By server</h2>
        {withAdvisories.map((r) => (
          <div key={r.slug} className="space-y-4 border-t border-ink/10 pt-6 first:border-0 first:pt-0">
            <h3 className="text-xl font-medium tracking-[-0.03em]">
              <Link href={`/agents/${r.slug}`} className="underline-offset-4 hover:underline">{r.name}</Link>
            </h3>
            {r.pkgs.filter((p) => p.total > 0).map((p) => (
              <div key={`${p.ecosystem}:${p.name}`} className="space-y-2">
                <p className="text-[15px]">
                  <span className="mono-num">{p.name}</span> <span className="text-muted-foreground">({p.ecosystem})</span>: <strong className="font-medium">{p.total}</strong> published
                  {p.affectingLatest !== null ? (
                    <>
                      , <strong className="font-medium">{p.affectingLatest}</strong> affecting the latest version ({p.latest})
                    </>
                  ) : (
                    <>, latest version not checked</>
                  )}
                  .
                </p>
                <ul className="space-y-2">
                  {p.vulns.map((v) => <VulnLine key={v.id} v={v} />)}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>

      <section className="section space-y-4">
        <h2 className="display-2 text-xl sm:text-2xl">Servers with no advisory listed</h2>
        <p className="prose-measure max-w-[42rem] text-sm leading-[1.6] text-muted-foreground">
          OSV lists nothing for these packages as of {fmtDate(ADVISORIES_CHECKED_AT)}. That is a statement about the database, not about the code.
        </p>
        <p className="prose-measure max-w-[42rem] text-[15px] leading-[1.7]">
          {withNone.map((r, i) => (
            <span key={r.slug}>
              {i > 0 ? ", " : ""}
              <Link href={`/agents/${r.slug}`} className={link}>{r.name}</Link>
            </span>
          ))}
          .
        </p>
        <p className="text-sm text-muted-foreground">
          Want a note when this page changes? The <Link href="/radar" className={link}>MCP Risk Radar</Link> reports new advisories. To check your own setup, use the <Link href="/check" className={link}>config checker</Link>.
        </p>
      </section>
    </div>
  );
}
