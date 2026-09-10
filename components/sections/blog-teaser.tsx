import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BlogCard } from "@/components/cards/blog-card";
import { Reveal } from "@/components/motion/reveal";
import type { BlogPost } from "@/lib/content";

export function BlogTeaser({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black">از وبلاگ</h2>
          <Link
            href="/blog"
            className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            همه
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>

        <ul className="grid gap-8 sm:grid-cols-2">
          {posts.map((post, index) => (
            <li key={post.url}>
              <Reveal delay={index * 80} className="h-full">
                <BlogCard post={post} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
