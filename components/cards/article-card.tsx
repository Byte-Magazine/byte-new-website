import Link from "next/link";

import { MetaLine } from "@/components/content/meta-line";
import type { Article } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  /** Shows the issue badge; off inside an issue's own listing. */
  showIssue?: boolean;
  className?: string;
}

/** Public path of an article's co-located assets. */
export function articleAssetBase(article: Article): string {
  return `/content/issues/${article.issueNumber}/${article.slug}`;
}

/**
 * Article summary.
 *
 * Deliberately has no image: only half the articles carry one, and those are
 * inline figures rather than posters, so a thumbnail row would be ragged and
 * would misrepresent the content. The issue's colour does the visual work.
 */
export function ArticleCard({
  article,
  showIssue = true,
  className,
}: ArticleCardProps) {
  return (
    <article
      className={cn("group relative h-full", className)}
      style={{ ["--issue-accent" as string]: article.issue.themeColor }}
    >
      <Link
        href={article.url}
        className="flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-issue hover:shadow-[0_10px_30px_-16px_var(--issue-accent)]"
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {showIssue ? (
            <span
              dir="ltr"
              className="rounded border px-1.5 py-0.5 font-mono"
              style={{ borderColor: article.issue.themeColor }}
            >
              {article.issueNumber}
            </span>
          ) : null}
          <span className="isolate">
            <time dateTime={article.date}>{formatJalali(article.date)}</time>
          </span>
          <span aria-hidden className="opacity-40">
            ·
          </span>
          <span className="isolate">
            {toPersianDigits(article.readingTime)} دقیقه
          </span>
        </div>

        <h3 className="mt-2.5 text-balance text-[1.05rem] font-bold leading-8 decoration-issue underline-offset-4 group-hover:underline">
          {article.title}
        </h3>

        {article.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
            {article.description}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {article.tags.length > 0 ? (
            <ul className="mb-3 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          {article.authors.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {article.authors.map((a) => a.name).join("، ")}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

/** Compact row used in dense lists where a card would be too heavy. */
export function ArticleRow({ article }: { article: Article }) {
  return (
    <Link
      href={article.url}
      className="group flex flex-col gap-1 py-4 transition-colors"
      style={{ ["--issue-accent" as string]: article.issue.themeColor }}
    >
      <h3 className="text-balance font-bold leading-8 decoration-issue underline-offset-4 group-hover:underline">
        {article.title}
      </h3>
      {article.description ? (
        <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
          {article.description}
        </p>
      ) : null}
      <MetaLine
        className="text-xs"
        items={[
          formatJalali(article.date),
          `${toPersianDigits(article.readingTime)} دقیقه`,
          article.authors.length > 0
            ? article.authors.map((a) => a.name).join("، ")
            : null,
        ]}
      />
    </Link>
  );
}
