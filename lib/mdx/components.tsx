import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import Link from "next/link";

import { Callout } from "@/components/content/callout";
import { Tooltip } from "@/components/content/tooltip";
import { Timeline, TimelineItem } from "@/components/content/timeline";
import { AuthorCallout, AuthorChip } from "@/components/content/author-chip";
import { Mermaid } from "@/components/content/mermaid";
import { MdxImage } from "@/components/content/mdx-image";

/** Internal links route through next/link; external ones open safely. */
function MdxLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) return <Link href={href} {...props} />;
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
}

function componentName(
  type: string | React.JSXElementConstructor<unknown>,
): string {
  if (typeof type === "string") return type;
  if ("displayName" in type && typeof type.displayName === "string") {
    return type.displayName;
  }
  if (typeof type === "function" && type.name) return type.name;
  return "";
}

/** Flatten pretty-code / MDX children into plain text for mermaid source. */
function textFromNode(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textFromNode(node.props.children);
  }
  return "";
}

function dataLanguage(
  props: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!props) return undefined;
  const value = props["data-language"] ?? props.dataLanguage;
  return typeof value === "string" ? value : undefined;
}

/**
 * Renders a paragraph as a <div> when it contains block-level content.
 *
 * Much of the migrated content wraps an image in a `<div>` on a single line,
 * which MDX parses as inline content and nests inside a `<p>`. That is invalid
 * HTML (and Instant View rejects `<img>` inside `<p>`).
 */
function MdxParagraph({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const hasBlockChild = Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    const type = child.type;
    if (typeof type === "string") {
      return [
        "div",
        "figure",
        "pre",
        "table",
        "ul",
        "ol",
        "blockquote",
        "img",
      ].includes(type);
    }
    const name = componentName(type);
    return (
      type === MdxImage ||
      type === Callout ||
      type === Timeline ||
      name === "MdxImage" ||
      name === "MdxImg"
    );
  });

  if (hasBlockChild) return <div {...props}>{children}</div>;
  return <p {...props}>{children}</p>;
}

/**
 * Renders ```mermaid fences as diagrams.
 *
 * After `rehype-pretty-code`, the language lives on `data-language` (not
 * `language-mermaid` on <code>), and the source is split across span tokens —
 * so we detect via data attributes and flatten text content.
 */
function MdxPre(props: ComponentPropsWithoutRef<"pre">) {
  const child = Children.toArray(props.children)[0];
  const childProps =
    isValidElement(child) && child.props && typeof child.props === "object"
      ? (child.props as Record<string, unknown>)
      : undefined;
  const className =
    typeof childProps?.className === "string" ? childProps.className : "";
  const lang =
    dataLanguage(props as Record<string, unknown>) ??
    dataLanguage(childProps) ??
    (className.includes("language-mermaid") ? "mermaid" : undefined);

  if (lang === "mermaid") {
    return <Mermaid chart={textFromNode(props.children).trim()} />;
  }
  return <pre {...props} />;
}

/**
 * Components available to every MDX file. Content carries no imports, so this
 * is the whole vocabulary an author can use.
 */
export function mdxComponents(baseUrl?: string) {
  function MdxImg(props: ComponentPropsWithoutRef<"img">) {
    return (
      <MdxImage
        src={props.src as string | undefined}
        alt={props.alt}
        title={props.title}
        baseUrl={baseUrl}
      />
    );
  }
  MdxImg.displayName = "MdxImg";

  function MdxTable(props: ComponentPropsWithoutRef<"table">) {
    return (
      <div dir="rtl" style={{ textAlign: "center", overflowX: "auto" }}>
        <table {...props} style={{ ...props.style, marginInline: "auto" }} />
      </div>
    );
  }

  return {
    a: MdxLink,
    p: MdxParagraph,
    pre: MdxPre,
    img: MdxImg,
    table: MdxTable,
    Callout,
    Tooltip,
    Timeline,
    TimelineItem,
    AuthorCallout,
    AuthorChip,
    Mermaid,
    Figure: MdxImage,
    // The legacy theme component; articles that used it just list authors.
    DocItemAuthors: () => null,
  };
}
