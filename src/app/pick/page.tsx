import type { Metadata } from "next";
import { PickTool } from "@/components/pick-tool";
import { Eyebrow } from "@/components/ui-kit";
import { cardViews } from "@/lib/verified-view";

export const metadata: Metadata = {
  title: "Pick an MCP server by what it must meet",
  description: "Filter verified MCP servers by job and by conditions such as a read-only option, no default telemetry and no published advisory on the latest version.",
  alternates: { canonical: "/pick" },
};

export default function PickPage() {
  const cards = cardViews();
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Pick</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Start from what you need, not from a popularity list.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Say what the server is for and what it must meet. We show the verified servers that qualify and, for each, what we could and could not
          confirm. It filters, it does not rank, and it only covers the {cards.length} servers we have read.
        </p>
      </header>
      <section className="section">
        <PickTool cards={cards} />
      </section>
    </div>
  );
}
