import type { Metadata } from "next";
import { Eyebrow, PillLink } from "@/components/ui-kit";

export const metadata: Metadata = { title: "Payment received", robots: { index: false, follow: false } };

export default function SponsorSuccessPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Eyebrow>Sponsor</Eyebrow>
      <h1 className="display-2 fs-title">Payment received.</h1>
      <p className="prose-measure text-[15px] leading-[1.65] text-muted-foreground">
        Stripe will email you a receipt. We review each placement before it appears, so yours is not live yet. We will
        contact you at the email you used at checkout if we need anything.
      </p>
      <PillLink href="/">Back to the rankings</PillLink>
    </div>
  );
}
