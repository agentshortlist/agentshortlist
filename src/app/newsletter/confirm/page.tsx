import type { Metadata } from "next";
import { TokenAction } from "@/components/token-action";

export const metadata: Metadata = { title: "Confirm your subscription", robots: { index: false, follow: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="display-2 fs-title">Confirm your subscription</h1>
      <p className="text-muted-foreground">Press the button to start receiving the AgentShortlist newsletter.</p>
      <TokenAction endpoint="/api/newsletter/confirm" token={token ?? ""} label="Confirm subscription" />
    </div>
  );
}
