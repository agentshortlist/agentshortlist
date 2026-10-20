import type { Metadata } from "next";
import { LiveCompare } from "@/components/live-compare";
import { Eyebrow } from "@/components/ui-kit";
import { cardViews } from "@/lib/verified-view";

export const metadata: Metadata = {
  title: "Compare MCP servers side by side, live",
  description: "Pick two or three MCP servers and compare what they can do, what they send out, upkeep and published advisories, line by line.",
  alternates: { canonical: "/compare/live" },
};

export default function LiveComparePage() {
  const cards = cardViews();
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Compare</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Compare MCP servers on what matters before you install.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Choose up to three of the {cards.length} servers we have read from their own docs and source. Rows that differ stand out. You can share the
          page: the choice is kept in the address.
        </p>
      </header>
      <section className="section">
        <LiveCompare cards={cards} />
      </section>
    </div>
  );
}
