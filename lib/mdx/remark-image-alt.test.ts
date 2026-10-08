import { describe, expect, it } from "vitest";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Image, Root } from "mdast";
import { visit } from "unist-util-visit";

import { remarkImageAlt } from "./remark-image-alt";

function alts(markdown: string, title = "مقاله"): string[] {
  const processor = unified().use(remarkParse).use(remarkImageAlt, { title });
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  const out: string[] = [];
  visit(tree, "image", (node: Image) => {
    out.push(node.alt ?? "");
  });
  return out;
}

describe("remarkImageAlt", () => {
  it("uses the title before any heading", () => {
    expect(alts("![](./a.png)")).toEqual(["مقاله"]);
  });

  it("names the nearest section heading", () => {
    expect(
      alts("## بخش اول\n\n![](./a.png)\n\n## بخش دوم\n\n![](./b.png)"),
    ).toEqual(["مقاله — بخش اول", "مقاله — بخش دوم"]);
  });

  it("numbers repeated images in one section", () => {
    expect(alts("## بخش\n\n![](./a.png)\n\n![](./b.png)")).toEqual([
      "مقاله — بخش",
      "مقاله — بخش (تصویر ۲)",
    ]);
  });

  it("keeps author-written alt text", () => {
    expect(alts("![لابی دانشکده](./a.png)")).toEqual(["لابی دانشکده"]);
  });

  it("reads heading text through inline markup", () => {
    expect(alts("## بخش **مهم** `code`\n\n![](./a.png)")).toEqual([
      "مقاله — بخش مهم code",
    ]);
  });
});
