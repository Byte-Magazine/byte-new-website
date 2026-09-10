import { MDXRemote } from "next-mdx-remote-client/rsc";

import { mdxComponents } from "@/lib/mdx/components";
import { mdxOptions } from "@/lib/mdx/options";

interface MdxContentProps {
  source: string;
  /** Public path for the document's co-located images. */
  baseUrl?: string;
}

/**
 * Compiles and renders MDX at build time inside a Server Component, so no MDX
 * tooling reaches the browser bundle.
 */
export function MdxContent({ source, baseUrl }: MdxContentProps) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents(baseUrl)}
      options={{ mdxOptions, parseFrontmatter: false }}
    />
  );
}

export default MdxContent;
