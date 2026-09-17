import Image from "next/image";
import Link from "next/link";

import { formatJalali, toPersianDigits } from "@/lib/persian";
import { issueAccentValue } from "@/lib/brand-color";
import { ISSUE_COVER_ASPECT_CLASS } from "@/lib/issue-cover";
import { cn } from "@/lib/utils";
import { MetaLine } from "@/components/content/meta-line";

/**
 * Only the fields the card renders, so it can take either a resolved `Issue`
 * from the content graph or a serialisable subset passed to a client component.
 */
export interface IssueCardData {
  number: string;
  url: string;
  cover: string;
  description: string;
  date: string;
  themeColor: string;
  articleCount: number;
}

/**
 * Issue covers are the archive's primary visual. Framed at A4 so the full
 * poster shows; the issue colour is a glow, not a crop.
 */
export function IssueCard({
  issue,
  className,
}: {
  issue: IssueCardData;
  className?: string;
}) {
  return (
    <Link
      href={issue.url}
      className={cn("group block", className)}
      style={{
        ["--issue-accent" as string]: issueAccentValue(issue.themeColor),
      }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-muted transition-shadow duration-300 group-hover:shadow-[0_12px_40px_-12px_var(--issue-accent)]",
          ISSUE_COVER_ASPECT_CLASS,
        )}
      >
        <Image
          src={issue.cover}
          alt={`جلد شمارهٔ ${issue.number}`}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <p className="mt-3 font-mono text-sm font-bold">
        <span dir="ltr">{issue.number}</span>
      </p>
      <p className="text-sm text-muted-foreground">{issue.description}</p>
      <MetaLine
        className="mt-0.5 text-xs"
        items={[
          formatJalali(issue.date),
          `${toPersianDigits(issue.articleCount)} مطلب`,
        ]}
      />
    </Link>
  );
}
