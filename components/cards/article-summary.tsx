import Link from "next/link";

import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

/**
 * The plain data an article card needs, with dates already formatted.
 *
 * Kept separate from the resolved `Article` type so the same card can render
 * on the server from the content graph and in the client-side browser from a
 * serialisable list, without two divergent designs.
 */
export interface ArticleSummaryData {
  url: string;
  title: string;
  description: string;
  jalaliDate: string;
  readingTime: number;
  issueNumber: string;
  themeColor: string;
  tags: string[];
  authorNames: string[];
}

/**
 * Article summary. Deliberately has no image: only half the articles carry
 * one, and those are inline figures rather than posters, so a thumbnail row
 * would be ragged and would misrepresent the content.
 */
export function ArticleSummary({
  article,
  showIssue = true,
  className,
}: {
  article: ArticleSummaryData;
  showIssue?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn("group h-full", className)}
      style={{ ["--issue-accent" as string]: article.themeColor }}
    >
      <Link
        href={article.url}
        className="flex h-full flex-col rounded-xl border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-issue hover:shadow-[0_10px_30px_-16px_var(--issue-accent)]"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {showIssue ? (
            <span
              dir="ltr"
              className="rounded border px-1.5 py-0.5 font-mono"
              style={{ borderColor: article.themeColor }}
            >
              {article.issueNumber}
            </span>
          ) : null}
          <span className="isolate">{article.jalaliDate}</span>
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

          {article.authorNames.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {article.authorNames.join("، ")}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
