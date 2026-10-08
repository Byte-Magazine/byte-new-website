import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/cards/article-card";
import { getAllTags, getTag, getTopic, isIndexableTag } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { tagDescription, truncate } from "@/lib/description";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = getTag(slug);
  if (!tag) return {};

  const topic = getTopic(tag);
  return {
    ...buildMetadata({
      // Hubs carry a Persian title; plain tags are prefixed so they never
      // share a title with an article ("سرمقاله").
      title: topic?.title ?? `برچسب: ${tag.name}`,
      description: topic ? truncate(topic.intro) : tagDescription(tag),
      path: tag.url,
    }),
    // Thin tag pages stay crawlable so their links pass, but out of the index.
    ...(isIndexableTag(tag) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  const topic = getTopic(tag);
  // The guide's picks are listed first; the grid below holds the rest.
  const picked = new Set(topic?.start.map((article) => article.url));
  const rest = tag.articles.filter((article) => !picked.has(article.url));

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "برچسب‌ها", url: "/tags" },
          { name: topic?.title ?? tag.name, url: tag.url },
        ])}
      />
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">
          {topic ? `پرونده · ${tag.name}` : "برچسب"}
        </p>
        <h1 className="mt-1 text-3xl font-black md:text-4xl">
          {topic?.title ?? tag.name}
        </h1>
        {topic ? (
          <p className="mt-4 max-w-3xl text-lg leading-9 text-muted-foreground">
            {topic.intro}
          </p>
        ) : null}
        <p className="mt-3 text-muted-foreground">
          {toPersianDigits(tag.count)} مطلب
        </p>
      </header>

      {topic ? (
        <section className="mb-14" aria-labelledby="start-here">
          <h2 id="start-here" className="mb-6 text-xl font-bold">
            از این‌جا شروع کنید
          </h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {topic.start.map((article) => (
              <li key={article.url}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section aria-labelledby={topic ? "more-in-topic" : undefined}>
          {topic ? (
            <h2 id="more-in-topic" className="mb-6 text-xl font-bold">
              مطالب دیگر
            </h2>
          ) : null}
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <li key={article.url}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tag.blogPosts.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-bold">وبلاگ</h2>
          <ul className="divide-y border-y">
            {tag.blogPosts.map((post) => (
              <li key={post.url}>
                <Link
                  href={post.url}
                  className="group block py-4 transition-colors hover:bg-muted/40"
                >
                  <span className="block font-bold leading-8 group-hover:underline">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatJalali(post.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
