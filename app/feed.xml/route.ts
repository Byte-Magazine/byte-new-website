import { getFeedItems, renderFeed } from "@/lib/feed";

// Required for output: "export" — the feed is generated once at build time.
export const dynamic = "force-static";

export function GET() {
  return new Response(renderFeed(getFeedItems()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
