/**
 * Copies co-located content assets into public/ so the static export can serve
 * them. Runs before build; safe to re-run.
 *
 * content/issues/00000101/quantum/img/1.png
 *   -> public/content/issues/00000101/quantum/img/1.png
 * content/issues/00000111/fieldintro-security/ctf.png
 *   -> public/content/issues/00000111/fieldintro-security/ctf.png
 */
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const CONTENT = join(ROOT, "content");
const TARGET = join(ROOT, "public", "content");

/** Everything except the documents themselves counts as an asset. */
function isDocument(name: string): boolean {
  return (
    /^index\.mdx?$/.test(name) || name.endsWith(".md") || name.endsWith(".mdx")
  );
}

/**
 * Collects a document's assets.
 *
 * Both shapes occur in the content: most articles keep images in an `img/`
 * subdirectory, but some place them directly beside `index.mdx`. Copying only
 * subdirectories silently dropped 13 images, so every non-document entry beside
 * a document is copied, whether it is a file or a directory.
 */
function collectAssets(
  dir: string,
  files: string[] = [],
  dirs: string[] = [],
): { files: string[]; dirs: string[] } {
  if (!existsSync(dir)) return { files, dirs };

  const entries = readdirSync(dir).filter((name) => !name.startsWith("."));
  const documentHere = entries.some(isDocument);

  for (const name of entries) {
    const path = join(dir, name);
    const directory = statSync(path).isDirectory();

    if (documentHere) {
      if (directory) dirs.push(path);
      else if (!isDocument(name)) files.push(path);
      continue;
    }

    if (directory) collectAssets(path, files, dirs);
  }

  return { files, dirs };
}

rmSync(TARGET, { recursive: true, force: true });

const { files, dirs } = collectAssets(CONTENT);

for (const dir of dirs) {
  const destination = join(TARGET, relative(CONTENT, dir));
  mkdirSync(destination, { recursive: true });
  cpSync(dir, destination, { recursive: true });
}

for (const file of files) {
  const destination = join(TARGET, relative(CONTENT, file));
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(file, destination);
}

console.log(
  `Synced ${dirs.length} asset directories and ${files.length} loose files to public/content`,
);
