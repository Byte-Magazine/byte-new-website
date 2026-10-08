import { describe, expect, it } from "vitest";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { Heading, Root } from "mdast";

import { remarkDemoteHeadings } from "./remark-demote-headings";

function depths(markdown: string): number[] {
  const processor = unified().use(remarkParse).use(remarkDemoteHeadings);
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  return tree.children
    .filter((node): node is Heading => node.type === "heading")
    .map((node) => node.depth);
}

describe("remarkDemoteHeadings", () => {
  it("shifts all headings when the document uses #", () => {
    expect(depths("# a\n\n## b\n\n### c")).toEqual([2, 3, 4]);
  });

  it("leaves documents that start at ## alone", () => {
    expect(depths("## a\n\n### b")).toEqual([2, 3]);
  });

  it("caps at h6", () => {
    expect(depths("# a\n\n###### b")).toEqual([2, 6]);
  });
});
