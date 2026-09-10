import type { ComponentPropsWithoutRef } from "react";
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
