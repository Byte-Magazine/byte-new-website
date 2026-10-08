import { createHash } from "node:crypto";

/**
 * IndexNow: tells Bing, Yandex and other participating engines which URLs
 * changed, so they re-crawl in minutes rather than on their own schedule.
 * Google does not take part; it still relies on the sitemap.
 *
 * The build records a fingerprint per page (see scripts/indexnow-manifest.ts).
 * On deploy, the new manifest is compared with the one the live site serves,
 * and only pages whose content changed are submitted.
 */

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Published at the site root so CI can diff against the live deployment. */
export const MANIFEST_FILE = "indexnow-manifest.json";

/** IndexNow keys are 8–128 characters of [a-zA-Z0-9-]. */
export function isValidKey(key: string): boolean {
  return /^[a-zA-Z0-9-]{8,128}$/.test(key);
}

/** URL path -> content fingerprint. */
export type Manifest = Record<string, string>;

/**
 * Fingerprint of what a search engine would index on a page: its title,
 * description, canonical and main content. Script bundles, build ids and the
 * RSC payload sit outside these and change on every build, so they are left
 * out — otherwise every deploy would report every page as changed.
 */
export function pageFingerprint(html: string): string {
  const pick = (pattern: RegExp) => html.match(pattern)?.[0] ?? "";
  const start = html.indexOf("<main");
  const end = html.lastIndexOf("</main>");
  const main = start !== -1 && end > start ? html.slice(start, end) : html;

  const material = [
    pick(/<title>[^<]*<\/title>/),
    pick(/<meta name="description"[^>]*>/),
    pick(/<link rel="canonical"[^>]*>/),
    pick(/<meta name="robots"[^>]*>/),
    main
      // Executable scripts carry the per-build payload; JSON-LD is content.
      .replace(
        /<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g,
        "",
      )
      .replace(/<link[^>]*>/g, "")
      .replace(/\/_next\/[^"'\s)]+/g, ""),
  ].join("\n");

  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

/** URLs to submit: pages added, changed, or removed since `previous`. */
export function changedPaths(
  previous: Manifest | null,
  next: Manifest,
): string[] {
  if (!previous) return Object.keys(next).sort();

  const changed = Object.entries(next)
    .filter(([path, hash]) => previous[path] !== hash)
    .map(([path]) => path);
  // Removed pages are submitted too, so engines see the 404 and drop them.
  const removed = Object.keys(previous).filter((path) => !(path in next));

  return [...changed, ...removed].sort();
}
