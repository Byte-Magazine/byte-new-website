import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/cards/article-card";
import { getAllTags, getTag } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

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

  return buildMetadata({
    title: tag.name,
    description: `${toPersianDigits(tag.count)} مطلب با برچسب «${tag.name}» در نشریه‌ی بایت`,
    path: tag.url,
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: slug } = await params;
  const tag = getTag(slug);
  if (!tag) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <p className="text-sm text-muted-foreground">برچسب</p>
        <h1 className="mt-1 text-3xl font-black md:text-4xl">{tag.name}</h1>
        <p className="mt-3 text-muted-foreground">
          {toPersianDigits(tag.count)} مطلب
        </p>
      </header>

      {tag.articles.length > 0 ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tag.articles.map((article) => (
            <li key={article.url}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
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
