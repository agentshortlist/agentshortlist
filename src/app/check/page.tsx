import type { Metadata } from "next";
import { ConfigCheck } from "@/components/config-check";
import { Eyebrow } from "@/components/ui-kit";
import { cardViews } from "@/lib/verified-view";

export const metadata: Metadata = {
  title: "MCP config checker: flags and advisories",
  description: "Paste your MCP configuration and see which documented safety options are missing and whether a pinned version has published advisories. Runs in your browser.",
  alternates: { canonical: "/check" },
};

export default function CheckPage() {
  const cards = cardViews();
  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Config checker</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Check your MCP setup against what each project documents.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Paste your configuration. For the {cards.length} servers with a verified card, we point out documented safety options you have not
          turned on, such as read-only modes and telemetry switches, and compare any pinned version with published advisories. It does not
          run anything, and it is not a security audit.
        </p>
      </header>
      <section className="section">
        <ConfigCheck cards={cards} />
      </section>
    </div>
  );
}
