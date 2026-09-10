/**
 * Copies co-located content images into public/ so the static export can serve
 * them. Runs before build; safe to re-run.
 *
 * content/issues/00000101/quantum/img/1.png
 *   -> public/content/issues/00000101/quantum/img/1.png
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const CONTENT = join(ROOT, "content");
const TARGET = join(ROOT, "public", "content");

/**
 * Finds asset directories: a directory sitting beside an index.mdx holds that
 * document's assets. Document directories themselves are never copied, only
 * their asset subdirectories.
 */
function findAssetDirs(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;

  const entries = readdirSync(dir).filter((name) => !name.startsWith("."));
  const isDocument = entries.includes("index.mdx");

  for (const name of entries) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;

    if (isDocument) out.push(path);
    else findAssetDirs(path, out);
  }
  return out;
}

rmSync(TARGET, { recursive: true, force: true });

const dirs = findAssetDirs(CONTENT);
for (const dir of dirs) {
  const destination = join(TARGET, relative(CONTENT, dir));
  mkdirSync(destination, { recursive: true });
  cpSync(dir, destination, { recursive: true });
}

console.log(`Synced ${dirs.length} image directories to public/content`);
