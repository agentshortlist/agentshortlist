import Link from "next/link";
import type { Metadata } from "next";
import { CheckoutButton } from "@/components/checkout-button";
import { FaqList } from "@/components/faq-list";
import { Eyebrow } from "@/components/ui-kit";
import { checkoutConfigured, getPriceLabel } from "@/lib/stripe";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sponsor AgentShortlist",
  description:
    "Feature your AI agent or tool in a clearly labeled sponsored slot. Sponsorship never changes rankings or scores.",
  alternates: { canonical: "/sponsor" },
};

const faq = [
  {
    q: "Does sponsoring improve my ranking?",
    a: "No. Scores come only from public GitHub signals and the published formula. A sponsored placement sits in its own labeled slot and never changes any score or position.",
  },
  {
    q: "Does my tool have to be listed?",
    a: "No. A sponsored placement is separate from the directory. To be ranked, a tool must meet the same inclusion rule as every other project.",
  },
  {
    q: "What happens after I pay?",
    a: "You enter your tool's name, website and a one-line description in Stripe Checkout. We review each placement before it appears, and it stays hidden until we approve it.",
  },
  {
    q: "How do I cancel?",
    a: "The Featured placement is a monthly subscription. You can cancel it from the customer portal link in your Stripe receipt. The terms page has the details.",
  },
];

export default async function SponsorPage() {
  const [featuredPrice, newsletterPrice] = await Promise.all([getPriceLabel("featured"), getPriceLabel("newsletter")]);
  const featuredOpen = checkoutConfigured("featured");
  const newsletterOpen = checkoutConfigured("newsletter");

  return (
    <div>
      <header className="space-y-6">
        <Eyebrow>Sponsor</Eyebrow>
        <h1 className="display-2 reveal max-w-4xl fs-title">Be seen where people compare AI agents.</h1>
        <p className="reveal reveal-1 prose-measure max-w-[42rem] text-[15px] leading-[1.65] text-muted-foreground">
          Sponsored placements are always labeled, always separate from the rankings, and never change a score. That is
          what keeps the rankings worth reading, and it is why a placement here is worth something.
        </p>
      </header>

      <section aria-labelledby="options" className="section space-y-8 ">
        <h2 id="options" className="display-2 fs-title">Two ways to sponsor</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="surface-lg flex flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="space-y-4">
              <p className="eyebrow">Featured placement</p>
              <p className="display text-4xl">{featuredPrice ?? "Opens soon"}</p>
              <ul className="space-y-2 text-sm text-foreground/85">
                <li>A labeled Sponsored slot on the home page and on every ranking.</li>
                <li>Your name, one line of description and a link marked as sponsored.</li>
                <li>Reviewed before it appears. Cancel any time.</li>
              </ul>
            </div>
            <CheckoutButton product="featured" label="Sponsor a placement" disabled={!featuredOpen} />
          </article>

          <article className="surface-lg flex flex-col justify-between gap-8 p-6 sm:p-8">
            <div className="space-y-4">
              <p className="eyebrow">Newsletter mention</p>
              <p className="display text-4xl">{newsletterPrice ?? "Opens soon"}</p>
              <ul className="space-y-2 text-sm text-foreground/85">
                <li>One sponsored mention in a newsletter issue, after the editorial content and labeled as sponsored.</li>
                <li>The newsletter has not sent its first issue yet. We will publish real audience numbers here once they exist, and not before.</li>
              </ul>
            </div>
            <CheckoutButton product="newsletter" label="Reserve a mention" disabled={!newsletterOpen} />
          </article>
        </div>
        <p className="prose-measure text-sm text-muted-foreground">
          Payments are handled by Stripe. By paying you accept the{" "}
          <Link href="/sponsor/terms" className="underline underline-offset-4 hover:text-foreground">sponsorship terms</Link>.
        </p>
      </section>

      <section aria-labelledby="how" className="section space-y-8 ">
        <h2 id="how" className="display-2 fs-title">How it works</h2>
        <ol className="grid gap-8 sm:grid-cols-3">
          {[
            { n: "01", t: "Pay in Stripe", d: "Choose a placement and add your tool's name, website and a one-line description at checkout." },
            { n: "02", t: "We review it", d: "Each placement is checked before it appears. Misleading, unsafe or unrelated listings are declined." },
            { n: "03", t: "It goes live, labeled", d: "Your placement appears in the Sponsored slot with a link marked as sponsored. The rankings stay untouched." },
          ].map((s) => (
            <li key={s.n} className="space-y-3">
              <p className="mono-num text-xs text-muted-foreground">{s.n}</p>
              <h3 className="text-lg font-medium tracking-[-0.035em]">{s.t}</h3>
              <p className="prose-measure text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="section space-y-8 ">
        <h2 id="faq" className="display-2 fs-title">Questions</h2>
        <FaqList items={faq} />
      </section>
    </div>
  );
}
