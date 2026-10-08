/**
 * Runs after `next build`: fingerprints every exported page into
 * out/indexnow-manifest.json, and — when INDEXNOW_KEY is set — writes the key
 * file IndexNow fetches to verify ownership of the host.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  isValidKey,
  MANIFEST_FILE,
  pageFingerprint,
  type Manifest,
} from "../lib/indexnow";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT = join(ROOT, "out");

/** Error pages are not URLs anyone should crawl. */
const SKIP = new Set(["/404/", "/_not-found/"]);

function pages(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== "_next") pages(path, found);
    } else if (name === "index.html") {
      found.push(path);
    }
  }
  return found;
}

const manifest: Manifest = {};
for (const file of pages(OUT)) {
  const dir = relative(OUT, file).replace(/index\.html$/, "");
  const path = `/${dir}`.replace(/\\/g, "/");
  if (SKIP.has(path)) continue;
  manifest[path] = pageFingerprint(readFileSync(file, "utf8"));
}

const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(join(OUT, MANIFEST_FILE), `${JSON.stringify(sorted)}\n`);
console.log(`IndexNow manifest: ${Object.keys(sorted).length} pages`);

const key = process.env.INDEXNOW_KEY?.trim();
if (key) {
  if (!isValidKey(key)) {
    throw new Error("INDEXNOW_KEY must be 8-128 characters of [a-zA-Z0-9-]");
  }
  writeFileSync(join(OUT, `${key}.txt`), key);
  console.log("IndexNow key file written");
}
