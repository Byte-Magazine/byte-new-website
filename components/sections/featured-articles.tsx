import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleCard } from "@/components/cards/article-card";
import type { Article } from "@/lib/content";

export function FeaturedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">تازه‌ترین مطالب</h2>
        <Link
          href="/articles"
          className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          همه
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.url}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </section>
  );
}
