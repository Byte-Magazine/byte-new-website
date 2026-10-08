import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorList } from "@/components/content/author-list";
import { MetaLine } from "@/components/content/meta-line";
import { TableOfContents } from "@/components/content/table-of-contents";
import { SubscribeCta } from "@/components/content/subscribe-cta";
import { TagList } from "@/components/content/tag-list";
import MdxContent from "@/components/mdx-content";
import { getAllBlogPosts, getBlogPost } from "@/lib/content";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";
import { metaDescription } from "@/lib/description";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  JsonLd,
  ogImage,
} from "@/lib/seo";
import { extractHeadings } from "@/lib/mdx/headings";

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
    description: metaDescription(post.description, post.body),
    path: post.url,
    image: ogImage.blog(post.slug),
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated,
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
          description: metaDescription(post.description, post.body),
          url: post.url,
          date: post.date,
          updated: post.updated,
          authors: post.authors.map((a) => ({ name: a.name, url: a.url })),
          tags: post.tags,
          image: ogImage.blog(post.slug),
          type: "BlogPosting",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "وبلاگ", url: "/blog" },
          { name: post.title, url: post.url },
        ])}
      />

      <nav data-iv="ignore" className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          وبلاگ
        </Link>
      </nav>

      <div className="lg:flex lg:gap-12">
        <article className="min-w-0 flex-1" data-iv="article">
          <p data-iv="kicker" className="sr-only">
            وبلاگ
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element -- plain img for Telegram IV */}
          <img
            data-iv="cover"
            src={ogImage.blog(post.slug)}
            alt=""
            width={1200}
            height={630}
            className="hidden"
          />

          <header className="mb-8 border-b pb-8">
            <h1 className="text-balance text-3xl font-black leading-[1.6]">
              {post.title}
            </h1>
            {post.description ? (
              <p
                data-iv="subtitle"
                className="mt-4 text-lg leading-9 text-muted-foreground"
              >
                {post.description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <AuthorList authors={post.authors} />
              <MetaLine
                items={[
                  <time key="date" dateTime={post.date} data-iv="date">
                    {formatJalaliLong(post.date)}
                  </time>,
                  post.updated ? (
                    <span key="updated">
                      به‌روزرسانی:{" "}
                      <time dateTime={post.updated}>
                        {formatJalaliLong(post.updated)}
                      </time>
                    </span>
                  ) : null,
                  `${toPersianDigits(post.readingTime)} دقیقه مطالعه`,
                ]}
              />
            </div>
          </header>

          <div className="prose max-w-none" data-iv="body">
            <MdxContent
              source={post.body}
              title={post.title}
              baseUrl={`/content/blog/${post.slug}`}
            />
          </div>

          {headings.length >= 2 ? (
            <details
              data-iv="ignore"
              className="mb-8 rounded-lg border bg-muted/40 p-4 lg:hidden"
            >
              <summary className="cursor-pointer font-bold">فهرست مطلب</summary>
              <div className="mt-3">
                <TableOfContents headings={headings} />
              </div>
            </details>
          ) : null}

          <div data-iv="ignore">
            <TagList tags={post.tags} className="mt-10" />
          </div>

          <SubscribeCta className="mt-10" />
        </article>

        {headings.length >= 2 ? (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto scroll-subtle">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
