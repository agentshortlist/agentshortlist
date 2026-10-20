import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "Compare MCP servers";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "Compare", title: "Compare MCP servers before you install", sub: "Up to three servers, line by line, with sources", seed: "compare-live" });
}
