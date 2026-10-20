import Link from "next/link";
import { SOURCE_LABEL, type Row, type VerifiedCard } from "@/content/verified";
import { SETTINGS } from "@/content/verified-meta";
import { ADVISORIES_CHECKED_AT, getAdvisories, osvUrl } from "@/lib/advisories";
import { fmtDate } from "@/lib/data";

function SourceTag({ row }: { row: Pick<Row, "source" | "url"> }) {
  const unknown = row.source === "unknown";
  const cls = `inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] leading-none ${
    unknown ? "border-ink/15 text-muted-foreground" : "border-ink/20 text-foreground/80"
  }`;
  if (row.url && !unknown) {
    return (
      <a href={row.url} target="_blank" rel="noopener noreferrer" className={`${cls} underline-offset-2 hover:underline`}>
        {SOURCE_LABEL[row.source]}
      </a>
    );
  }
  return <span className={cls}>{SOURCE_LABEL[row.source]}</span>;
}

function Rows({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="surface space-y-4 p-5 sm:p-6">
      <h3 className="eyebrow">{title}</h3>
      <dl className="divide-y divide-ink/10">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr] sm:gap-4">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="space-y-1.5 text-[15px] leading-[1.55] text-foreground/90">
              <span className={r.source === "unknown" ? "text-muted-foreground" : ""}>{r.value}</span>
              <span className="block"><SourceTag row={r} /></span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}


function Advisories({ slug }: { slug: string }) {
  const pkgs = getAdvisories(slug);
  return (
    <div className="surface space-y-5 p-5 sm:p-6">
      <div className="space-y-2">
        <h3 className="eyebrow">Published security advisories</h3>
        <p className="text-sm leading-[1.6] text-muted-foreground">
          From OSV.dev, checked {fmtDate(ADVISORIES_CHECKED_AT)}, for the packages below. No advisory published does not mean a package is safe:
          it means nobody has reported one that OSV lists. These are reports written by others; we did not test them.
        </p>
      </div>
      {pkgs.length === 0 ? (
        <p className="text-[15px] text-muted-foreground">
          Not checked. We have not matched this project to a package on npm, PyPI or Go that we could confirm belongs to the same repository.
        </p>
      ) : (
        pkgs.map((p) => (
          <div key={`${p.ecosystem}:${p.name}`} className="space-y-3 border-t border-ink/10 pt-4 first:border-0 first:pt-0">
            <p className="text-[15px]">
              <span className="mono-num">{p.name}</span> <span className="text-muted-foreground">({p.ecosystem})</span>:{" "}
              <strong className="font-medium">{p.total}</strong> published
              {p.affectingLatest !== null ? (
                <>
                  , <strong className="font-medium">{p.affectingLatest}</strong> affecting the latest version ({p.latest})
                </>
              ) : (
                <>, latest version not checked</>
              )}
              .
            </p>
            {p.vulns.length > 0 && (
              <ul className="space-y-2">
                {p.vulns.slice(0, 5).map((v) => (
                  <li key={v.id} className="text-sm leading-[1.55]">
                    <a href={osvUrl(v.id)} target="_blank" rel="noopener noreferrer" className="mono-num underline underline-offset-4 hover:text-foreground">{v.id}</a>
                    {v.severity ? <span className="text-muted-foreground"> · {v.severity.toLowerCase()}</span> : null}
                    <span className="text-muted-foreground"> · {v.published}</span>
                    {v.fixedIn.length > 0 ? <span className="text-muted-foreground"> · fixed in {v.fixedIn.join(", ")}</span> : null}
                    <span className="block text-foreground/85">{v.summary}</span>
                  </li>
                ))}
                {p.vulns.length > 5 && <li className="text-sm text-muted-foreground">And {p.vulns.length - 5} more on OSV.dev.</li>}
              </ul>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function Settings({ slug }: { slug: string }) {
  const list = SETTINGS[slug];
  if (!list?.length) return null;
  return (
    <div className="surface space-y-4 p-5 sm:p-6">
      <div className="space-y-2">
        <h3 className="eyebrow">Settings it asks for</h3>
        <p className="text-sm leading-[1.6] text-muted-foreground">
          Names only, taken from the project&apos;s README or source. Never paste real values into a page, a chat or a repository.
        </p>
      </div>
      <ul className="divide-y divide-ink/10">
        {list.map((x) => (
          <li key={x.name} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[17rem_1fr] sm:gap-4">
            <p className="mono-num text-[13px] break-words">
              {x.name}
              <span className="ml-2 font-sans text-xs text-muted-foreground">{x.required ? "required" : "optional"}</span>
            </p>
            <p className="space-y-1.5 text-[15px] leading-[1.55] text-foreground/90">
              <span>{x.note}</span>{" "}
              <a href={x.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-ink/20 px-2 py-0.5 align-middle text-[0.6875rem] leading-none text-foreground/80 underline-offset-2 hover:underline">
                Source
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Ficha verificada a mano. Cada dato indica de dónde sale; lo que no se ha podido comprobar se muestra como tal.
export function VerifiedCardView({ card }: { card: VerifiedCard }) {
  return (
    <section aria-labelledby="verified" className="section space-y-8">
      <div className="space-y-3">
        <h2 id="verified" className="display-2 fs-title">Verified card</h2>
        <p className="prose-measure text-[15px] leading-[1.65] text-muted-foreground">
          Read from the project&apos;s documentation and source on {fmtDate(card.reviewedAt)}, version {card.version}. Every line says where it comes from.
          This is what the project says and what its code shows. It is not a security audit and not a hands-on test. See{" "}
          <Link href="/methodology#verified-cards" className="underline underline-offset-4 hover:text-foreground">how verified cards work</Link>.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Rows title="What it is for" rows={card.use} />
        <Rows title="Tools and context cost" rows={card.context} />
        <Rows title="What it can do" rows={card.permissions} />
        <Rows title="Maintenance" rows={card.maintenance} />
      </div>
      <Settings slug={card.slug} />
      <Advisories slug={card.slug} />

      {card.hardening.length > 0 && (
        <div className="space-y-4">
          <h3 className="display-2 text-2xl">Limit what it can do</h3>
          {card.hardening.map((h) => (
            <div key={h.title} className="surface space-y-3 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-medium tracking-[-0.02em]">{h.title}</p>
                <SourceTag row={h} />
              </div>
              <p className="text-sm leading-[1.6] text-muted-foreground">{h.note}</p>
              <pre className="mono-num overflow-x-auto rounded-xl bg-ink/[0.06] p-4 text-[13px] leading-[1.6]"><code>{h.code}</code></pre>
            </div>
          ))}
        </div>
      )}

      {card.alternative && (
        <div className="surface space-y-2 p-5 sm:p-6">
          <h3 className="eyebrow">Alternative</h3>
          <p className="text-[15px] leading-[1.6]">
            <a href={card.alternative.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
              {card.alternative.name}
            </a>
            . {card.alternative.note}
          </p>
          <SourceTag row={{ source: card.alternative.source, url: card.alternative.url }} />
        </div>
      )}
    </section>
  );
}
