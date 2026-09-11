import { visit } from "unist-util-visit";
import type { Parent, Root, RootContent } from "mdast";

const ADMONITION_TYPES = new Set([
  "danger",
  "info",
  "note",
  "tip",
  "warning",
  "caution",
]);

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}

interface MdxJsxFlowElement extends Parent {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: MdxJsxAttribute[];
  children: RootContent[];
}

function attribute(name: string, value: string): MdxJsxAttribute {
  return { type: "mdxJsxAttribute", name, value };
}

/** Reads the `:::type title` marker from the first text node of a paragraph. */
function readOpener(node: RootContent): { type: string; title: string } | null {
  if (node.type !== "paragraph" || node.children.length === 0) return null;
  const first = node.children[0];
  if (first.type !== "text") return null;

  // Match against the first line only: the paragraph's text node holds the
  // whole block, and `.` would not cross the newlines.
  const firstLine = first.value.split("\n", 1)[0];
  const match = firstLine.match(/^:::(\w+)[ \t]*(.*)$/);
  if (!match || !ADMONITION_TYPES.has(match[1])) return null;

  return {
    type: match[1] === "caution" ? "warning" : match[1],
    title: match[2].trim(),
  };
}

/**
 * Converts Docusaurus-style `:::type` admonition blocks into `<Callout>`
 * elements so authors can keep writing the familiar syntax.
 *
 * Content already migrated uses `<Callout>` directly; this keeps the shorthand
 * working for anything written from here on.
 */
export function remarkAdmonition() {
  return (tree: Root) => {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index === undefined) return;

      const opener = readOpener(node);
      if (!opener) return;

      // The paragraph holds the whole block when the fence is tight:
      // ":::tip\ncontent\n:::" parses as one paragraph with hard breaks.
      const textNode = node.children[0];
      if (textNode.type !== "text") return;

      const lines = textNode.value.split("\n");
      const closing = lines.findIndex(
        (line, i) => i > 0 && /^:::\s*$/.test(line),
      );

      const inner = (closing === -1 ? lines.slice(1) : lines.slice(1, closing))
        .join("\n")
        .trim();

      const rest = node.children.slice(1);
      const children: RootContent[] = [];
      if (inner) {
        children.push({
          type: "paragraph",
          children: [{ type: "text", value: inner }, ...rest],
        } as RootContent);
      } else if (rest.length > 0) {
        children.push({ type: "paragraph", children: rest } as RootContent);
      }

      const attributes = [attribute("type", opener.type)];
      if (opener.title) attributes.push(attribute("title", opener.title));

      const element: MdxJsxFlowElement = {
        type: "mdxJsxFlowElement",
        name: "Callout",
        attributes,
        children,
      };

      parent.children[index] = element as unknown as RootContent;
    });
  };
}

export default remarkAdmonition;
