"use client";

import { useId, useState } from "react";

// FAQ numerada y animada. El contenido siempre está en el DOM (lectores y buscadores lo ven);
// colapsado se oculta con visibility, así que no recibe foco.
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  return (
    <div className="hairline-top">
      {items.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-p${i}`;
        const btnId = `${uid}-b${i}`;
        return (
          <div key={f.q} className="faq-item border-b border-ink/[0.09]" data-open={isOpen}>
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-start gap-5 rounded-md py-5 text-left outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mono-num mt-1 w-6 shrink-0 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-base font-medium tracking-[-0.035em] sm:text-lg">{f.q}</span>
                <span className="faq-icon mt-0.5 font-mono text-lg leading-none text-muted-foreground" aria-hidden="true">+</span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="faq-panel">
              <div>
                <p className="prose-measure pb-5 pl-11 text-muted-foreground">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
