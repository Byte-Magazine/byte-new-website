import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorList } from "@/components/content/author-list";
import { MetaLine } from "@/components/content/meta-line";
import { TableOfContents } from "@/components/content/table-of-contents";
import { TagList } from "@/components/content/tag-list";
import MdxContent from "@/components/mdx-content";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";
import { articleJsonLd, buildMetadata, JsonLd, ogImage } from "@/lib/seo";
import { extractHeadings } from "@/lib/toc";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: [post.slug] }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug.join("/"));
  if (!post) return {};

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: post.url,
    image: ogImage.blog(post.slug),
    type: "article",
    publishedTime: post.date,
    authors: post.authors.map((a) => a.name),
    tags: post.tags,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug.join("/"));
  if (!post) notFound();

  const headings = extractHeadings(post.body);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          url: post.url,
          date: post.date,
          authors: post.authors.map((a) => ({ name: a.name, url: a.url })),
          tags: post.tags,
          type: "BlogPosting",
        })}
      />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          وبلاگ
        </Link>
      </nav>

      <div className="lg:flex lg:gap-12">
        <article className="min-w-0 flex-1">
          <header className="mb-8 border-b pb-8">
            <h1 className="text-balance text-3xl font-black leading-[1.6]">
              {post.title}
            </h1>
            {post.description ? (
              <p className="mt-4 text-lg leading-9 text-muted-foreground">
                {post.description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <AuthorList authors={post.authors} />
              <MetaLine
                items={[
                  <time key="date" dateTime={post.date}>
                    {formatJalaliLong(post.date)}
                  </time>,
                  `${toPersianDigits(post.readingTime)} دقیقه مطالعه`,
                ]}
              />
            </div>
          </header>

          <div className="prose max-w-none">
            <MdxContent
              source={post.body}
              baseUrl={`/content/blog/${post.slug}`}
            />
          </div>

          {headings.length >= 2 ? (
            <details className="mb-8 rounded-lg border bg-muted/40 p-4 lg:hidden">
              <summary className="cursor-pointer font-bold">فهرست مطلب</summary>
              <div className="mt-3">
                <TableOfContents headings={headings} />
              </div>
            </details>
          ) : null}

          <TagList tags={post.tags} className="mt-10" />
        </article>

        {headings.length >= 2 ? (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
