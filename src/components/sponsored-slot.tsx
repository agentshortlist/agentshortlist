import Link from "next/link";
import { getSponsors } from "@/lib/stripe";

// Espacio patrocinado: separado del ranking, siempre etiquetado y fuera del ItemList / JSON-LD.
// Los enlaces llevan rel="sponsored". Sin patrocinadores aprobados, muestra la plaza libre.
export async function SponsoredSlot() {
  const sponsors = await getSponsors();
  return (
    <aside
      aria-label="Sponsored placement"
      className="rounded-xl border border-dashed border-ink/25 p-5 sm:p-6"
      data-sponsored-slot
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-md border border-ink/30 px-2 py-0.5 font-mono text-[0.6875rem] uppercase leading-5 tracking-[0.12em] text-foreground/85">
          Sponsored
        </span>
        <p className="text-xs text-muted-foreground">Paid placement. It never changes a score or a position.</p>
      </div>
      {sponsors.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {sponsors.map((s) => (
            <li key={s.id} className="space-y-1">
              <a
                href={s.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="font-medium tracking-[-0.02em] underline-offset-4 hover:underline"
              >
                {s.name}
              </a>
              {s.tagline && <p className="text-sm text-muted-foreground">{s.tagline}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-foreground/85">
          This slot is open.{" "}
          <Link href="/sponsor" className="underline underline-offset-4 hover:text-ink">
            See how sponsoring works
          </Link>
          .
        </p>
      )}
    </aside>
  );
}
