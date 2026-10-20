import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Pick an MCP server";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "MCP servers", title: "Pick an MCP server", sub: "Filter by what you need and what it must meet", seed: "pick" });
}
