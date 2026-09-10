/**
 * Verifies that every URL the legacy Docusaurus site published still resolves
 * in the exported output.
 *
 * Derives the old URLs from the legacy repo rather than a hand-written list,
 * so nothing is missed. Exits non-zero and names every missing path.
 *
 * Usage: pnpm verify:urls   (override the source with BYTE_LEGACY_PATH)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LEGACY = resolve(ROOT, process.env.BYTE_LEGACY_PATH ?? "../byte-site");
const OUT = join(ROOT, "out");

function findMarkdown(dir: string): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    if (!existsSync(current)) return;
    for (const name of readdirSync(current)) {
      if (name.startsWith(".")) continue;
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.mdx?$/.test(name)) out.push(path);
    }
  };
  walk(dir);
  return out;
}

/** Strips the `NN-` ordering prefix Docusaurus used for sidebar order. */
function stripOrder(name: string): string {
  return name.replace(/^\d+-/, "");
}

/**
 * The authoritative route list from the legacy build cache, when present.
 * Preferred over deriving paths from filenames, since it is what Docusaurus
 * actually published.
 */
function cachedRoutes(): string[] | null {
  const file = join(LEGACY, ".docusaurus", "globalData.json");
  if (!existsSync(file)) return null;

  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as Record<
      string,
      Record<string, { versions?: Array<{ docs?: Array<{ path?: string }> }> }>
    >;
    const docs = data["docusaurus-plugin-content-docs"];
    if (!docs) return null;

    const routes: string[] = [];
    for (const plugin of Object.values(docs)) {
      for (const version of plugin.versions ?? []) {
        for (const doc of version.docs ?? []) {
          if (doc.path) routes.push(doc.path.replace(/\/$/, ""));
        }
      }
    }
    return routes.length > 0 ? routes : null;
  } catch {
    return null;
  }
}

function legacyUrls(): string[] {
  const urls = new Set<string>([
    "/",
    "/mags/intro",
    "/blog",
    "/staff",
    "/authors",
    "/codenameh",
  ]);

  const cached = cachedRoutes();
  if (cached) {
    for (const route of cached) {
      // /docs/* is unused Docusaurus scaffolding: a single "# empty" page
      // that never appeared in the navigation. Deliberately not migrated.
      if (route.startsWith("/docs")) continue;
      urls.add(route);
    }
  }

  // Mag issues and their articles.
  for (const file of findMarkdown(join(LEGACY, "mags"))) {
    const rel = relative(join(LEGACY, "mags"), file);
    const parts = rel.split("/");
    if (parts.length < 2) continue;

    const issue = parts[0];
    if (!/^[01]{8}$/.test(issue)) continue;
    urls.add(`/mags/${issue}`);

    const isIndex = /^index\.mdx?$/.test(basename(file));
    const name = isIndex
      ? basename(dirname(file))
      : basename(file).replace(/\.mdx?$/, "");
    urls.add(`/mags/${issue}/${stripOrder(name)}`);
  }

  // Workshops.
  for (const file of findMarkdown(join(LEGACY, "workshops"))) {
    const rel = relative(join(LEGACY, "workshops"), file);
    const parts = rel.split("/");
    if (parts.length < 2) continue;

    const workshop = parts[0];
    const isIndex = /^index\.mdx?$/.test(basename(file));
    const name = isIndex
      ? basename(dirname(file))
      : basename(file).replace(/\.mdx?$/, "");
    urls.add(`/workshops/${workshop}/${stripOrder(name)}`);
  }

  // Blog posts: legacy paths are /blog/<slug> from a MM-DD-slug directory.
  for (const file of findMarkdown(join(LEGACY, "blog"))) {
    const rel = relative(join(LEGACY, "blog"), file);
    const parts = rel.split("/");
    if (parts.length < 2) continue;

    const isIndex = /^index\.mdx?$/.test(basename(file));
    const name = isIndex
      ? basename(dirname(file))
      : basename(file).replace(/\.mdx?$/, "");
    const match = name.match(/^\d{2}-\d{2}-(.+)$/);
    if (match) urls.add(`/blog/${match[1]}`);
  }

  return [...urls].sort();
}

function exists(url: string): boolean {
  const path = url === "/" ? OUT : join(OUT, url);
  return existsSync(join(path, "index.html")) || existsSync(`${path}.html`);
}

function main() {
  if (!existsSync(OUT)) {
    console.error("out/ not found — run `pnpm build` first.");
    process.exit(1);
  }
  if (!existsSync(LEGACY)) {
    console.error(`legacy site not found at ${LEGACY}; set BYTE_LEGACY_PATH`);
    process.exit(1);
  }

  const urls = legacyUrls();
  const missing = urls.filter((url) => !exists(url));

  console.log(`Checked ${urls.length} legacy URLs.`);

  if (missing.length > 0) {
    console.error(`\n${missing.length} missing:`);
    for (const url of missing) console.error(`  ${url}`);
    process.exit(1);
  }

  console.log("All legacy URLs resolve.");
}

main();
