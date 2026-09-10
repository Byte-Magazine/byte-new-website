import type { Metadata } from "next";

import { BlogCard } from "@/components/cards/blog-card";
import { Reveal } from "@/components/motion/reveal";
import { getAllBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "وبلاگ",
  description: "یادداشت‌ها و گزارش‌های نشریه‌ی بایت",
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-black md:text-4xl">وبلاگ</h1>
        <p className="mt-4 max-w-xl text-lg leading-9 text-muted-foreground">
          یادداشت‌ها و گزارش‌هایی که بیرون از شماره‌های نشریه منتشر می‌شوند.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          هنوز یادداشتی منتشر نشده است.
        </p>
      ) : (
        <ul className="grid gap-10 sm:grid-cols-2">
          {posts.map((post, index) => (
            <li key={post.url}>
              <Reveal delay={index * 60}>
                <BlogCard post={post} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
