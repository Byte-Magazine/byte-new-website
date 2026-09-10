import type { Metadata } from "next";
import Link from "next/link";

import { MetaLine } from "@/components/content/meta-line";
import { getAllBlogPosts } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "وبلاگ",
  description: "یادداشت‌ها و گزارش‌های نشریه‌ی بایت",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black md:text-4xl">وبلاگ</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          یادداشت‌ها و گزارش‌هایی که بیرون از شماره‌های نشریه منتشر می‌شوند.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          هنوز یادداشتی منتشر نشده است.
        </p>
      ) : (
        <ul className="divide-y border-y">
          {posts.map((post) => (
            <li key={post.url}>
              <Link
                href={post.url}
                className="group block py-6 transition-colors hover:bg-muted/40"
              >
                <h2 className="text-xl font-bold leading-9 decoration-accent underline-offset-4 group-hover:underline">
                  {post.title}
                </h2>
                {post.description ? (
                  <p className="mt-2 leading-8 text-muted-foreground">
                    {post.description}
                  </p>
                ) : null}
                <MetaLine
                  className="mt-3 text-xs"
                  items={[
                    <time key="date" dateTime={post.date}>
                      {formatJalali(post.date)}
                    </time>,
                    `${toPersianDigits(post.readingTime)} دقیقه`,
                    post.authors.length > 0
                      ? post.authors.map((a) => a.name).join("، ")
                      : null,
                  ]}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
