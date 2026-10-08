/**
 * Deploy-time IndexNow client. Two steps, run around the publish step:
 *
 *   tsx scripts/indexnow-submit.ts snapshot   # before publishing
 *   tsx scripts/indexnow-submit.ts submit     # after publishing
 *
 * `snapshot` saves the manifest the live site serves now. `submit` waits for
 * the new deployment to go live (GitHub Pages and its CDN lag the push), then
 * submits the pages that differ. Without INDEXNOW_KEY it does nothing, and it
 * never fails the deploy: indexing hints are best-effort.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  changedPaths,
  INDEXNOW_ENDPOINT,
  isValidKey,
  MANIFEST_FILE,
  type Manifest,
} from "../lib/indexnow";
import { SITE } from "../lib/site";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LOCAL_MANIFEST = join(ROOT, "out", MANIFEST_FILE);
const SNAPSHOT = join(ROOT, ".indexnow-previous.json");

const POLL_INTERVAL_MS = 20_000;
const POLL_TIMEOUT_MS = 15 * 60_000;
const BATCH = 10_000;

async function fetchLiveManifest(): Promise<Manifest | null> {
  // Cache-busting query: the CDN in front of Pages caches for ten minutes.
  const url = `${SITE.url}/${MANIFEST_FILE}?t=${Date.now()}`;
  const response = await fetch(url, {
    headers: { "cache-control": "no-cache" },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return (await response.json()) as Manifest;
}

async function snapshot() {
  const live = await fetchLiveManifest();
  writeFileSync(SNAPSHOT, JSON.stringify(live));
  console.log(
    live
      ? `Snapshot: ${Object.keys(live).length} live pages`
      : "Snapshot: no live manifest yet; every page will be submitted",
  );
}

async function waitForDeployment(expected: Manifest) {
  const target = JSON.stringify(expected);
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const live = await fetchLiveManifest().catch(() => null);
    if (live && JSON.stringify(live) === target) return;
    await new Promise((done) => setTimeout(done, POLL_INTERVAL_MS));
  }
  throw new Error("new deployment did not go live within 15 minutes");
}

async function submit(key: string) {
  const next = JSON.parse(readFileSync(LOCAL_MANIFEST, "utf8")) as Manifest;
  const previous = existsSync(SNAPSHOT)
    ? (JSON.parse(readFileSync(SNAPSHOT, "utf8")) as Manifest | null)
    : null;

  const paths = changedPaths(previous, next);
  if (paths.length === 0) {
    console.log("IndexNow: no page changed");
    return;
  }

  await waitForDeployment(next);

  const host = new URL(SITE.url).host;
  const urls = paths.map((path) => `${SITE.url}${path}`);
  for (let i = 0; i < urls.length; i += BATCH) {
    const urlList = urls.slice(i, i + BATCH);
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${SITE.url}/${key}.txt`,
        urlList,
      }),
    });
    // 200 and 202 both mean accepted; 202 is "key validation pending".
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(
        `IndexNow: HTTP ${response.status} ${await response.text()}`,
      );
    }
  }
  console.log(`IndexNow: submitted ${urls.length} URLs`);
  for (const url of urls.slice(0, 20)) console.log(`  ${url}`);
  if (urls.length > 20) console.log(`  … and ${urls.length - 20} more`);
}

async function main() {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) {
    console.log("INDEXNOW_KEY is not set; skipping IndexNow");
    return;
  }
  if (!isValidKey(key)) throw new Error("INDEXNOW_KEY is malformed");

  const command = process.argv[2];
  if (command === "snapshot") await snapshot();
  else if (command === "submit") await submit(key);
  else throw new Error("usage: indexnow-submit.ts snapshot|submit");
}

main().catch((error) => {
  // Best-effort: report loudly, but never fail the deploy over it.
  console.error(`::warning::${error instanceof Error ? error.message : error}`);
});
