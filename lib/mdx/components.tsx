import { Children, isValidElement, type ComponentPropsWithoutRef } from "react";
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

/**
 * Renders a paragraph as a <div> when it contains block-level content.
 *
 * Much of the migrated content wraps an image in a `<div>` on a single line,
 * which MDX parses as inline content and nests inside a `<p>`. That is invalid
 * HTML, so the browser moves the div out during parsing and the DOM no longer
 * matches what the server rendered — a hydration error on every such page.
 */
function MdxParagraph({ children, ...props }: ComponentPropsWithoutRef<"p">) {
  const hasBlockChild = Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;
    const type = child.type;
    if (typeof type === "string") {
      return ["div", "figure", "pre", "table", "ul", "ol", "blockquote"].includes(
        type,
      );
    }
    // Our own components that render a block wrapper.
    return type === MdxImage || type === Callout || type === Timeline;
  });

  if (hasBlockChild) return <div {...props}>{children}</div>;
  return <p {...props}>{children}</p>;
}

/** Renders ```mermaid fences as diagrams and everything else as code. */
function MdxPre(props: ComponentPropsWithoutRef<"pre">) {
  const child = props.children as
    | { props?: { className?: string; children?: string } }
    | undefined;
  const className = child?.props?.className ?? "";

  if (className.includes("language-mermaid")) {
    return <Mermaid chart={String(child?.props?.children ?? "")} />;
  }
  return <pre {...props} />;
}

/**
 * Components available to every MDX file. Content carries no imports, so this
 * is the whole vocabulary an author can use.
 */
export function mdxComponents(baseUrl?: string) {
  return {
    a: MdxLink,
    p: MdxParagraph,
    pre: MdxPre,
    img: (props: ComponentPropsWithoutRef<"img">) => (
      <MdxImage
        src={props.src as string | undefined}
        alt={props.alt}
        title={props.title}
        baseUrl={baseUrl}
      />
    ),
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
