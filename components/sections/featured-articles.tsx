import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleCard } from "@/components/cards/article-card";
import { Reveal } from "@/components/motion/reveal";
import type { Article } from "@/lib/content";

export function FeaturedArticles({ articles }: { articles: readonly Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">تازه‌ترین مطالب</h2>
        <Link
          href="/articles"
          className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          همه
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </Reveal>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <li key={article.url}>
            <Reveal delay={index * 70} className="h-full">
              <ArticleCard article={article} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
