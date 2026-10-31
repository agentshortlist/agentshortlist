import { TESTS } from "@/content/tests";

export const dynamic = "force-static";

export function GET() {
  const body = { license: "CC BY 4.0", source: "https://agentshortlist.dev/data", records: TESTS };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
