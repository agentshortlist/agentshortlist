import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";
import { PAIRS } from "@/lib/compare";
import { CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Compare AI agents side by side",
  description: "Head-to-head comparisons of the top tools in each category, built only from public GitHub data.",
  alternates: { canonical: "/compare" },
};

export default function CompareIndexPage() {
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Compare</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Side by side.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          {PAIRS.length} head-to-head comparisons between the top tools of each category. Each one uses only public GitHub
          data and shows exactly where the two differ.
        </p>
      </header>
      {CATEGORIES.map((c) => {
        const list = PAIRS.filter((p) => p.category === c.slug);
        if (!list.length) return null;
        return (
          <section key={c.slug} aria-labelledby={`c-${c.slug}`} className="section space-y-5 ">
            <h2 id={`c-${c.slug}`} className="display-2 text-xl sm:text-3xl">{c.name}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <li key={p.slug}>
                  <Link href={`/compare/${p.slug}`} className="surface surface-hover block h-full p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="block font-medium tracking-[-0.035em]">{p.a.name} vs {p.b.name}</span>
                    <span className="mono-num mt-2 block text-xs text-muted-foreground">{p.a.score} vs {p.b.score} of 100</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
