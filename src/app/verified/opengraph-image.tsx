import { VERIFIED } from "@/content/verified";
import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Verified MCP cards";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "MCP servers", title: "Verified MCP cards", sub: `${VERIFIED.length} servers read from their own docs and source, with a source on every line`, seed: "verified" });
}
