import type { Heading, Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Shifts every heading one level down when the document uses `#`.
 *
 * The page template already renders the title as the page's only <h1>. Some
 * migrated documents also open sections with `#`, which gave those pages
 * several <h1>s and left their sections out of the table of contents (it
 * lists h2/h3). Demoting keeps the document's own hierarchy intact under the
 * title. Documents that start at `##` are left untouched.
 */
export function remarkDemoteHeadings() {
  return (tree: Root) => {
    let hasH1 = false;
    visit(tree, "heading", (node: Heading) => {
      if (node.depth === 1) hasH1 = true;
    });
    if (!hasH1) return;

    visit(tree, "heading", (node: Heading) => {
      node.depth = Math.min(node.depth + 1, 6) as Heading["depth"];
    });
  };
}
