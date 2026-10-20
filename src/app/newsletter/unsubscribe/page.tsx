import type { Metadata } from "next";
import { TokenAction } from "@/components/token-action";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="display-2 fs-title">Unsubscribe</h1>
      <p className="text-muted-foreground">Press the button to stop receiving the AgentShortlist newsletter.</p>
      <TokenAction endpoint="/api/newsletter/unsubscribe" token={token ?? ""} label="Unsubscribe" />
    </div>
  );
}
