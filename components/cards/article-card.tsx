import type { Article } from "@/lib/content";
import { formatJalali } from "@/lib/persian";

import { ArticleSummary } from "./article-summary";

/** Public path of an article's co-located assets. */
export function articleAssetBase(article: Article): string {
  return `/content/issues/${article.issueNumber}/${article.slug}`;
}

/** Renders a resolved Article with the shared summary card. */
export function ArticleCard({
  article,
  showIssue = true,
  className,
}: {
  article: Article;
  showIssue?: boolean;
  className?: string;
}) {
  return (
    <ArticleSummary
      showIssue={showIssue}
      className={className}
      article={{
        url: article.url,
        title: article.title,
        description: article.description,
        jalaliDate: formatJalali(article.date),
        readingTime: article.readingTime,
        issueNumber: article.issueNumber,
        themeColor: article.issue.themeColor,
        tags: article.tags,
        authors: article.authors.map((a) => ({
          name: a.name,
          image: a.image,
        })),
      }}
    />
  );
}
