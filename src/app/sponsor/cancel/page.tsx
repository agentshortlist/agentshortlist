import type { Metadata } from "next";
import { Eyebrow, PillLink } from "@/components/ui-kit";

export const metadata: Metadata = { title: "Checkout canceled", robots: { index: false, follow: false } };

export default function SponsorCancelPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Eyebrow>Sponsor</Eyebrow>
      <h1 className="display-2 fs-title">Checkout canceled.</h1>
      <p className="prose-measure text-[15px] leading-[1.65] text-muted-foreground">No payment was made. You can start again whenever you like.</p>
      <PillLink href="/sponsor">Back to sponsoring</PillLink>
    </div>
  );
}
