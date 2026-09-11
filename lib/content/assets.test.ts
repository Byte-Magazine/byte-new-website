import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const CONTENT = join(process.cwd(), "content");

function documents(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) documents(path, out);
    else if (/^index\.mdx?$/.test(name)) out.push(path);
  }
  return out;
}

/**
 * Images live in two shapes: inside an `img/` folder, or directly beside the
 * document. An earlier sync script only handled the first and silently dropped
 * 13 images, so this asserts every reference resolves to a real file.
 */
describe("content assets", () => {
  const files = documents(CONTENT);

  it("finds the migrated documents", () => {
    expect(files.length).toBeGreaterThan(90);
  });

  it("has a file behind every relative image reference", () => {
    const broken: string[] = [];

    for (const file of files) {
      const body = require("node:fs").readFileSync(file, "utf8") as string;
      // Skip JSX comments: they never render, so their references are inert.
      const live = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

      const refs = [
        ...live.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g),
        ...live.matchAll(/src="([^"]+)"/g),
      ].map((match) => match[1]);

      for (const ref of refs) {
        if (/^(https?:|\/|data:)/.test(ref)) continue;
        const target = normalize(join(dirname(file), ref));
        if (!existsSync(target)) broken.push(`${file} -> ${ref}`);
      }
    }

    expect(broken).toEqual([]);
  });
});
