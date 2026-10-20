import { OG_SIZE, ogCard } from "@/lib/og-card";

export const alt = "MCP config checker";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ eyebrow: "MCP servers", title: "MCP config checker", sub: "Paste your MCP configuration. It runs in your browser and sends nothing.", seed: "check" });
}
