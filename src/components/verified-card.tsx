import Link from "next/link";
import { SOURCE_LABEL, type Row, type VerifiedCard } from "@/content/verified";
import { SETTINGS } from "@/content/verified-meta";
import { ADVISORIES_CHECKED_AT, getAdvisories, osvUrl } from "@/lib/advisories";
import { fmtDate } from "@/lib/data";
import { CopyCodeButton } from "@/components/copy-code-button";
import { cardViews } from "@/lib/verified-view";
import { GITHUB_URL } from "@/lib/site";
import { testsFor, type ProbeStatus } from "@/content/tests";
import { ACCESS, NEEDS_LABEL } from "@/content/access";

const STATUS: Record<ProbeStatus, string> = { pass: "Pass", fail: "Fail", "not-run": "Not run" };
const fmtDownloads = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function SourceTag({ row }: { row: Pick<Row, "source" | "url"> }) {
  const unknown = row.source === "unknown";
  const ours = row.source === "own-view";
  const cls = `inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] leading-none ${
    unknown ? "border-ink/15 text-muted-foreground" : ours ? "border-dashed border-ink/40 text-foreground/80" : "border-ink/20 text-foreground/80"
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

function Scores({ slug }: { slug: string }) {
  const v = cardViews().find((x) => x.slug === slug);
  if (!v) return null;
  return (
    <div className="surface space-y-3 p-5 sm:p-6">
      <h3 className="eyebrow">Health and risk</h3>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Project health</dt>
          <dd className="text-[15px]">{v.health.level} ({v.health.score}/100){v.health.limited ? ", estimate: no push date" : ""}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Risk from what we read</dt>
          <dd className="text-[15px]">{v.risk.level} ({v.risk.score}/100){v.risk.limited ? ", estimate: several items not verified" : ""}</dd>
        </div>
      </dl>
      {v.risk.reasons.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {v.risk.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Simple rules, not a security audit. <Link href="/methodology#scores" className="underline underline-offset-4">How they work</Link>.</p>
    </div>
  );
}

// Resume de dónde sale cada línea de la ficha. "Probado" no existe todavía: se muestra como tal en vez de omitirse.
function Evidence({ card }: { card: VerifiedCard }) {
  const rows = [...card.use, ...card.context, ...card.permissions, ...card.maintenance];
  const documented = rows.filter((r) => r.source !== "unknown" && r.source !== "own-view").length;
  const ours = rows.filter((r) => r.source === "own-view").length;
  const unknown = rows.filter((r) => r.source === "unknown").length;
  const runs = testsFor(card.slug);
  return (
    <div className="surface space-y-3 p-5 sm:p-6">
      <h3 className="eyebrow">Evidence on this card</h3>
      <dl className="grid gap-4 sm:grid-cols-4">
        <div><dt className="text-sm text-muted-foreground">Documented</dt><dd className="text-[15px]">{documented} of {rows.length} lines, with a source</dd></div>
        <div><dt className="text-sm text-muted-foreground">Our view</dt><dd className="text-[15px]">{ours} {ours === 1 ? "line" : "lines"}, marked as ours</dd></div>
        <div><dt className="text-sm text-muted-foreground">Not verified</dt><dd className="text-[15px]">{unknown} {unknown === 1 ? "line" : "lines"}, shown as unknown</dd></div>
        <div><dt className="text-sm text-muted-foreground">Tested by us</dt><dd className="text-[15px]">{runs.length ? `${runs.length} ${runs.length === 1 ? "run" : "runs"}, last ${fmtDate(runs[0].testedAt)}` : "Not yet"}</dd></div>
      </dl>
      <p className="text-xs text-muted-foreground">
        A line is documented when the project or its package says it. <Link href="/methodology#evidence" className="underline underline-offset-4">What each label means</Link>.
      </p>
    </div>
  );
}

// Qué hace falta para empezar, tomado de la línea de credenciales de la propia ficha. No incluye el precio del servicio de terceros.
function AccessBlock({ slug }: { slug: string }) {
  const v = cardViews().find((x) => x.slug === slug);
  if (!v) return null;
  const a = ACCESS[slug];
  return (
    <div className="surface space-y-3 p-5 sm:p-6">
      <h3 className="eyebrow">What you need to start</h3>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Access</dt>
          <dd className="text-[15px]">{NEEDS_LABEL[v.needs]}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Software license</dt>
          <dd className="text-[15px]">{v.openSource ? "Open-source license detected on GitHub" : "No open-source license detected on GitHub"}</dd>
        </div>
      </dl>
      {a && <p className="text-sm leading-[1.6] text-muted-foreground">{a.note}</p>}
      <p className="text-xs text-muted-foreground">
        Taken from the credentials line of this card. The price of a third-party service is not checked: a free server can still sit on a paid service.{" "}
        <Link href="/methodology#access" className="underline underline-offset-4">What the labels mean</Link>.
      </p>
    </div>
  );
}

// Descargas semanales de los paquetes confirmados como del mismo repositorio. Mide uso de instalación, incluidos CI y espejos; no calidad.
function Adoption({ slug }: { slug: string }) {
  const pkgs = getAdvisories(slug).filter((p) => p.ecosystem !== "Go");
  if (!pkgs.length) return null;
  return (
    <div className="surface space-y-3 p-5 sm:p-6">
      <h3 className="eyebrow">Package downloads, last 7 days</h3>
      <ul className="space-y-1 text-[15px]">
        {pkgs.map((p) => (
          <li key={`${p.ecosystem}:${p.name}`}>
            <span className="mono-num">{p.name}</span> <span className="text-muted-foreground">({p.ecosystem})</span>:{" "}
            {typeof p.weeklyDownloads === "number" ? <strong className="font-medium">{fmtDownloads(p.weeklyDownloads)}</strong> : <span className="text-muted-foreground">not available</span>}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        From the npm registry and pypistats.org, checked {fmtDate(ADVISORIES_CHECKED_AT)}. Downloads include automated installs and mirrors, so they show how widely a package is pulled, not how many people use it or how good it is.
      </p>
    </div>
  );
}

function TestRuns({ slug }: { slug: string }) {
  const runs = testsFor(slug);
  if (!runs.length) return null;
  return (
    <div className="surface space-y-4 p-5 sm:p-6">
      <div className="space-y-2">
        <h3 className="eyebrow">Tested by us</h3>
        <p className="text-sm leading-[1.6] text-muted-foreground">
          Each run is one exact combination. A pass means the server started, answered the handshake and listed its tools. It does not mean the tools work or that limits such as read-only hold.
        </p>
      </div>
      {runs.map((t) => (
        <dl key={`${t.testedAt}:${t.package}:${t.client}`} className="grid gap-x-6 gap-y-1 border-t border-ink/10 pt-4 text-sm first:border-0 first:pt-0 sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Date</dt><dd>{fmtDate(t.testedAt)}</dd></div>
          <div><dt className="text-muted-foreground">Package</dt><dd className="mono-num">{t.package}</dd></div>
          <div><dt className="text-muted-foreground">Client</dt><dd>{t.client} {t.clientVersion}</dd></div>
          <div><dt className="text-muted-foreground">System</dt><dd>{t.os}</dd></div>
          <div><dt className="text-muted-foreground">Environment</dt><dd>{t.environment}</dd></div>
          <div><dt className="text-muted-foreground">Install, handshake, tools list</dt><dd>{STATUS[t.install]}, {STATUS[t.handshake]}, {STATUS[t.toolsList.status]}{t.toolsList.count !== null ? ` (${t.toolsList.count} tools)` : ""}</dd></div>
          {t.call && <div className="sm:col-span-2"><dt className="text-muted-foreground">Harmless call</dt><dd>{t.call.tool}: {STATUS[t.call.status]}. {t.call.note}</dd></div>}
          {t.notes && <div className="sm:col-span-2"><dt className="text-muted-foreground">Notes</dt><dd>{t.notes}</dd></div>}
        </dl>
      ))}
    </div>
  );
}

function Report({ card }: { card: VerifiedCard }) {
  const body = `Server: ${card.slug}\nCard reviewed: ${card.reviewedAt}, version ${card.version}\n\nWhat did you test or find? (client and version, operating system, what happened, link to a source for a correction)\n\n`;
  const href = `${GITHUB_URL}/issues/new?title=${encodeURIComponent(`Card report: ${card.slug}`)}&body=${encodeURIComponent(body)}`;
  return (
    <div className="surface space-y-2 p-5 sm:p-6">
      <h3 className="eyebrow">Tested it, or spotted a mistake?</h3>
      <p className="text-[15px] leading-[1.6]">
        Tell us what you ran or what is wrong, with a source if you have one.{" "}
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Open a report on GitHub</a>.
        Corrections change the card. They never change a score or a position.
      </p>
    </div>
  );
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
      <Evidence card={card} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Rows title="What it is for" rows={card.use} />
        <Rows title="Tools and context cost" rows={card.context} />
        <Rows title="What it can do" rows={card.permissions} />
        <Rows title="Maintenance" rows={card.maintenance} />
      </div>
      <Scores slug={card.slug} />
      <AccessBlock slug={card.slug} />
      <Adoption slug={card.slug} />
      <TestRuns slug={card.slug} />
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
              <CopyCodeButton code={h.code} slug={card.slug} />
            </div>
          ))}
        </div>
      )}

      <Report card={card} />

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
