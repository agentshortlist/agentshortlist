import Link from "next/link";
import { tickerFacts, type Fact } from "@/lib/facts";

function Item({ fact, plain = false }: { fact: Fact; plain?: boolean }) {
  const content = (
    <>
      <span>{fact.label}</span>
      <strong>{fact.value}</strong>
    </>
  );
  return (
    <span className="site-ticker-item">
      {fact.href && !plain ? <Link href={fact.href} className="inline-flex gap-2">{content}</Link> : <span className="inline-flex gap-2">{content}</span>}
      <span className="site-ticker-sep" aria-hidden="true">/</span>
    </span>
  );
}

// Franja inferior con datos reales del catálogo. Dos copias del conjunto para un bucle continuo;
// la segunda va oculta a lectores de pantalla. Se pausa con el puntero o el foco.
export function SiteTicker() {
  const facts = tickerFacts();
  return (
    <aside className="site-ticker" aria-label="Catalog facts">
      <div className="site-ticker-glass" aria-hidden="true" />
      <div className="site-ticker-track" style={{ ["--ticker-duration" as string]: `${facts.length * 7}s` }}>
        <div className="site-ticker-set">
          <span className="site-ticker-item"><i aria-hidden="true" className="size-1.5 rounded-full bg-signal" /><strong>Data</strong></span>
          {facts.map((f) => <Item key={f.key} fact={f} />)}
        </div>
        <div className="site-ticker-set" aria-hidden="true">
          <span className="site-ticker-item"><i aria-hidden="true" className="size-1.5 rounded-full bg-signal" /><strong>Data</strong></span>
          {facts.map((f) => <Item key={`${f.key}-2`} fact={f} plain />)}
        </div>
      </div>
    </aside>
  );
}
