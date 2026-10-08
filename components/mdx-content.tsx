import { MDXRemote } from "next-mdx-remote-client/rsc";

import { mdxComponents } from "@/lib/mdx/components";
import { mdxOptions } from "@/lib/mdx/options";
import { remarkImageAlt } from "@/lib/mdx/remark-image-alt";

interface MdxContentProps {
  source: string;
  /** Public path for the document's co-located images. */
  baseUrl?: string;
  /** Document title, used to describe images that have no alt text. */
  title?: string;
}

/**
 * Compiles and renders MDX at build time inside a Server Component, so no MDX
 * tooling reaches the browser bundle.
 */
export function MdxContent({ source, baseUrl, title }: MdxContentProps) {
  const options = title
    ? {
        ...mdxOptions,
        remarkPlugins: [
          ...mdxOptions.remarkPlugins,
          [remarkImageAlt, { title }],
        ],
      }
    : mdxOptions;

  return (
    <MDXRemote
      source={source}
      components={mdxComponents(baseUrl)}
      options={{ mdxOptions: options, parseFrontmatter: false }}
    />
  );
}

export default MdxContent;
