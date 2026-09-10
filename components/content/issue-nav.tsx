"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

interface IssueNavProps {
  issueNumber: string;
  issueUrl: string;
  description: string;
  articles: Array<{ url: string; title: string }>;
}

/**
 * Every article in the current issue, with the one being read marked.
 *
 * Mirrors the workshop lesson list: a reader arriving at one article should be
 * able to see the whole issue and move through it without going back.
 */
export function IssueNav({
  issueNumber,
  issueUrl,
  description,
  articles,
}: IssueNavProps) {
  const pathname = usePathname();
  const normalize = (value: string) => value.replace(/\/$/, "");

  return (
    <nav aria-label={`مطالب شمارهٔ ${issueNumber}`} className="text-sm">
      <Link href={issueUrl} className="group block">
        <span
          dir="ltr"
          className="block font-mono text-xs text-muted-foreground"
        >
          {issueNumber}
        </span>
        <span className="mt-0.5 block font-bold group-hover:underline">
          {description}
        </span>
        <span className="text-xs text-muted-foreground">
          {toPersianDigits(articles.length)} مطلب
        </span>
      </Link>

      <ol className="mt-4 space-y-0.5 border-s ps-2">
        {articles.map((article, index) => {
          const active = normalize(pathname) === normalize(article.url);
          return (
            <li key={article.url}>
              <Link
                href={article.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex gap-2 rounded-md px-2 py-1.5 leading-7 transition-colors",
                  active
                    ? "bg-issue/10 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  dir="ltr"
                  className={cn(
                    "shrink-0 font-mono text-xs",
                    active ? "text-issue" : "opacity-50",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-2">{article.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
