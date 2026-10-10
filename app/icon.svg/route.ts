import { readFileSync } from "node:fs";
import path from "node:path";
import { siteAccent } from "@/lib/brand";

export const dynamic = "force-static";

/**
 * Favicon in the site's accent colour (newest issue's cover colour), so the
 * tab icon matches the page. `DynamicFavicon` recolours it per page on the
 * client; this is the build-time default for first paint and crawlers.
 */
export function GET() {
  const logo = readFileSync(
    path.join(process.cwd(), "public/img/logo.svg"),
    "utf8",
  );
  const svg = logo.replace(
    /fill="#[0-9a-fA-F]{3,8}"/,
    `fill="${siteAccent().dark}"`,
  );
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
