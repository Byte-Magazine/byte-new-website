import { cache } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import type { Root } from "hast";
import { visit } from "unist-util-visit";

import { remarkAdmonition } from "./remark-admonition";

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Extracts the document's h2/h3 headings with the exact ids rehype-slug will
 * assign when the page renders.
 *
 * The markdown is run through the same slug plugin the render pipeline uses,
 * rather than re-implementing the slug algorithm: a hand-written version
 * drifted and left 107 dead anchors across the site.
 */
export const extractHeadings = cache((source: string): Heading[] => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAdmonition)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug);

  const tree = processor.runSync(processor.parse(source)) as Root;
  const headings: Heading[] = [];

  visit(tree, "element", (node) => {
    if (node.tagName !== "h2" && node.tagName !== "h3") return;
    const id = String(node.properties?.id ?? "");
    if (!id) return;

    let text = "";
    visit(node, "text", (child) => {
      text += child.value;
    });
    text = text.trim();
    // A heading whose text is only markup (an image wrapped in "##", say) is
    // not a section and would give the rail a meaningless entry.
    if (!text || !/[\p{L}\p{N}]/u.test(text)) return;

    headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
  });

  return headings;
});
