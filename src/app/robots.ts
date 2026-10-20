import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const BOTS = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
