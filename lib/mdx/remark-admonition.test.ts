import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root } from "mdast";
import { remarkAdmonition } from "./remark-admonition";

interface JsxNode {
  type: string;
  name?: string;
  attributes?: Array<{ name: string; value: string }>;
  children?: JsxNode[];
  value?: string;
}

/**
 * Runs the plugin and returns the tree. remark-stringify cannot serialize MDX
 * JSX nodes, so assertions are made against the tree the MDX compiler receives.
 */
function run(input: string): JsxNode[] {
  const tree = unified().use(remarkParse).parse(input) as Root;
  unified().use(remarkAdmonition).runSync(tree);
  return tree.children as unknown as JsxNode[];
}

function textOf(node: JsxNode): string {
  if (node.value) return node.value;
  return (node.children ?? []).map(textOf).join(" ");
}

describe("remarkAdmonition", () => {
  it("turns a tip directive into a Callout element", () => {
    const [node] = run(":::tip\nمحتوا\n:::");
    expect(node.type).toBe("mdxJsxFlowElement");
    expect(node.name).toBe("Callout");
  });

  it("sets the type attribute", () => {
    const [node] = run(":::info\nمتن\n:::");
    expect(node.attributes).toContainEqual({
      type: "mdxJsxAttribute",
      name: "type",
      value: "info",
    });
  });

  it("preserves an admonition title", () => {
    const [node] = run(":::warning هشدار\nمحتوا\n:::");
    expect(node.attributes).toContainEqual({
      type: "mdxJsxAttribute",
      name: "title",
      value: "هشدار",
    });
  });

  it("keeps the admonition body content", () => {
    const [node] = run(":::info\nمتن داخلی\n:::");
    expect(textOf(node)).toContain("متن داخلی");
  });

  it("maps caution to warning", () => {
    const [node] = run(":::caution\nمتن\n:::");
    expect(node.attributes).toContainEqual({
      type: "mdxJsxAttribute",
      name: "type",
      value: "warning",
    });
  });

  it("omits the title attribute when there is none", () => {
    const [node] = run(":::tip\nمتن\n:::");
    expect(node.attributes?.some((a) => a.name === "title")).toBe(false);
  });

  it("leaves ordinary paragraphs untouched", () => {
    const [node] = run("سلام دنیا");
    expect(node.type).toBe("paragraph");
  });

  it("does not transform an unknown directive type", () => {
    const [node] = run(":::unknown\nمتن\n:::");
    expect(node.type).toBe("paragraph");
  });
});
