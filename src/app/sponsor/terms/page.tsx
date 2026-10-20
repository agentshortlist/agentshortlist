import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui-kit";

export const metadata: Metadata = {
  title: "Sponsorship terms",
  description: "Terms for sponsored placements on AgentShortlist: labeling, editorial independence, review, billing and cancellation.",
  alternates: { canonical: "/sponsor/terms" },
};

const sections: { h: string; p: string[] }[] = [
  {
    h: "Editorial independence",
    p: [
      "Sponsorship never changes a tool's score, position or inclusion in any ranking. Scores are computed from public GitHub data with the formula on the methodology page.",
    ],
  },
  {
    h: "Labeling",
    p: [
      "Every sponsored placement is labeled \"Sponsored\", shown in its own slot separate from the rankings, and its links carry rel=\"sponsored\".",
    ],
  },
  {
    h: "Review and acceptance",
    p: [
      "Each placement is reviewed before it appears and stays hidden until approved. We may decline or remove a placement that is misleading, unsafe, unlawful or unrelated to AI agents and developer tools.",
      "If we decline a placement before it is displayed, we refund the payment in full.",
    ],
  },
  {
    h: "Billing and cancellation",
    p: [
      "The Featured placement is a monthly subscription billed through Stripe. You can cancel at any time; the placement stays up until the end of the period you have paid for.",
      "The newsletter mention is a one-time payment for one mention in an upcoming issue. We do not guarantee a send date, an audience size or any result.",
    ],
  },
  {
    h: "Your information",
    p: [
      "Payments and receipts are handled by Stripe. The name, website and description you enter at checkout are stored with your subscription in Stripe and used to display your placement.",
    ],
  },
];

export default function SponsorshipTermsPage() {
  return (
    <article className="max-w-3xl space-y-6 [&_p]:text-foreground/85">
      <Eyebrow>Sponsorship</Eyebrow>
      <h1 className="display-2 fs-title">Terms</h1>
      <p className="text-sm text-muted-foreground">Last updated 2026-10-18.</p>
      {sections.map((s) => (
        <section key={s.h} className="space-y-3">
          <h2 className="display-2 pt-4 text-xl sm:text-2xl">{s.h}</h2>
          {s.p.map((t) => (
            <p key={t} className="prose-measure">{t}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
