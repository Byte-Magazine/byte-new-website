import Image from "next/image";
import Link from "next/link";

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

function coverUrl(article: Article): string | undefined {
  if (!article.cover) return undefined;
  return `${articleAssetBase(article)}/${article.cover.replace(/^\.\//, "")}`;
}

export function ArticleCard({
  article,
  showIssue = true,
  className,
}: ArticleCardProps) {
  const cover = coverUrl(article);

  return (
    <article
      className={cn("group relative flex flex-col", className)}
      style={{ ["--issue-accent" as string]: article.issue.themeColor }}
    >
      <Link href={article.url} className="flex h-full flex-col">
        <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-lg border bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <span
              className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-muted-foreground/40"
              dir="ltr"
            >
              {article.issueNumber}
            </span>
          )}
        </div>

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
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <span className="isolate">
            {toPersianDigits(article.readingTime)} دقیقه
          </span>
        </div>

        <h3 className="mt-1.5 text-balance text-[1.05rem] font-bold leading-8 decoration-issue underline-offset-4 group-hover:underline">
          {article.title}
        </h3>

        {article.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-7 text-muted-foreground">
            {article.description}
          </p>
        ) : null}

        {article.authors.length > 0 ? (
          <p className="mt-auto pt-3 text-xs text-muted-foreground">
            {article.authors.map((a) => a.name).join("، ")}
          </p>
        ) : null}
      </Link>
    </article>
  );
}
