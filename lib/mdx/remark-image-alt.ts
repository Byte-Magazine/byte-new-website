import type { Heading, Image, Root } from "mdast";
import { visit } from "unist-util-visit";

import { toPersianDigits } from "../persian";

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value?: unknown;
}

interface MdxJsxElement {
  type: "mdxJsxFlowElement" | "mdxJsxTextElement";
  name: string | null;
  attributes: Array<MdxJsxAttribute | { type: string }>;
}

export interface ImageAltOptions {
  /** Document title; the alt text of last resort. */
  title: string;
}

/** Plain text of a heading, skipping markup and inline code formatting. */
function headingText(node: Heading): string {
  let text = "";
  visit(node, (child) => {
    if ("value" in child && typeof child.value === "string") {
      text += child.value;
    }
  });
  return text.replace(/\s+/g, " ").trim();
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

/**
 * Gives every image without alt text one derived from where it sits: the
 * document title and the section heading above it, numbered when a section
 * holds several images.
 *
 * Nearly all migrated content uses `![](./img/x.png)`, so images reached
 * search engines and screen readers as decorative. Context is a floor, not a
 * substitute: an author-written `![description](...)` always wins.
 */
export function remarkImageAlt({ title }: ImageAltOptions) {
  return (tree: Root) => {
    let section = "";
    const used = new Map<string, number>();

    const nextAlt = () => {
      const base =
        section && section !== title ? `${title} — ${section}` : title;
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      return count === 1 ? base : `${base} (تصویر ${toPersianDigits(count)})`;
    };

    // One pass in document order, so `section` is always the nearest heading
    // above the image.
    visit(tree, (node) => {
      if (node.type === "heading") {
        const text = headingText(node as Heading);
        if (text) section = text;
        return;
      }

      if (node.type === "image") {
        const image = node as Image;
        if (isBlank(image.alt)) image.alt = nextAlt();
        return;
      }

      if (
        (node.type === "mdxJsxFlowElement" ||
          node.type === "mdxJsxTextElement") &&
        ((node as unknown as MdxJsxElement).name === "img" ||
          (node as unknown as MdxJsxElement).name === "Image")
      ) {
        const element = node as unknown as MdxJsxElement;
        const alt = element.attributes.find(
          (attr): attr is MdxJsxAttribute =>
            attr.type === "mdxJsxAttribute" &&
            (attr as MdxJsxAttribute).name === "alt",
        );
        if (!alt) {
          element.attributes.push({
            type: "mdxJsxAttribute",
            name: "alt",
            value: nextAlt(),
          });
        } else if (isBlank(alt.value) && typeof alt.value !== "object") {
          // Leave expression values (alt={x}) alone; only fill literal blanks.
          alt.value = nextAlt();
        }
      }
    });
  };
}
