import Link from "next/link";
import { licenseMix } from "@/lib/coverage";
import { fmtDate, type Agent } from "@/lib/data";

// Alcance de un ranking: qué cubre, mezcla de licencias, fecha y límites. Todo calculado con los datos mostrados.
export function ScopeBlock({ list, noun, updated }: { list: Agent[]; noun: string; updated: string }) {
  const m = licenseMix(list);
  return (
    <section aria-labelledby="scope" className="section space-y-6 " data-scope>
      <h2 id="scope" className="display-2 fs-title">Scope of this ranking</h2>
      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="surface p-5">
          <dt className="eyebrow">Covers</dt>
          <dd className="mt-3 text-sm text-foreground/90">{m.total} {noun}, all public GitHub repositories, checked {fmtDate(updated)}.</dd>
        </div>
        <div className="surface p-5">
          <dt className="eyebrow">License mix</dt>
          <dd className="mt-3 text-sm text-foreground/90">
            {m.osi} of {m.total} with an OSI license{m.osiLabels.length ? ` (${m.osiLabels.map((l) => `${l.license} ${l.count}`).join(", ")})` : ""}
            {m.other ? `; ${m.other} with another license` : ""}
            {m.notStated ? `; ${m.notStated} with none detected` : ""}.
          </dd>
        </div>
        <div className="surface p-5">
          <dt className="eyebrow">Limits</dt>
          <dd className="mt-3 text-sm text-foreground/90">
            Closed-source products are not covered, and the score favors open-source licenses. It measures popularity and
            maintenance, not performance on your task.
          </dd>
        </div>
      </dl>
      <p className="text-sm text-muted-foreground">
        See the full <Link href="/coverage" className="underline underline-offset-4 hover:text-foreground">coverage page</Link> and the{" "}
        <Link href="/methodology" className="underline underline-offset-4 hover:text-foreground">methodology</Link>.
      </p>
    </section>
  );
}
