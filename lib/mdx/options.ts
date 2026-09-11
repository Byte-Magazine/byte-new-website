import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { remarkAdmonition } from "./remark-admonition";

/**
 * Shared MDX plugin chain. Used by every content route so articles, blog
 * posts, and workshop docs render identically.
 *
 * `lib/mdx/headings.ts` runs the same `rehype-slug` over the same markdown to
 * build the table of contents, so its anchors always match the rendered ids.
 */
export const mdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath, remarkAdmonition],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "wrap",
        properties: { className: "heading-anchor" },
      },
    ],
    [
      rehypePrettyCode,
      {
        theme: { light: "github-light", dark: "github-dark-dimmed" },
        keepBackground: false,
        defaultLang: "plaintext",
      },
    ],
    rehypeKatex,
  ],
} as any;
