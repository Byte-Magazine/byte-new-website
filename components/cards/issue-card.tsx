import Image from "next/image";
import Link from "next/link";

import type { Issue } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";
import { MetaLine } from "@/components/content/meta-line";

/**
 * Issue covers are the archive's primary visual. They render at their true aspect
 * ratio with the issue's own colour as a glow, so the wall of covers carries
 * the identity rather than uniform cards.
 */
export function IssueCard({
  issue,
  className,
}: {
  issue: Issue;
  className?: string;
}) {
  return (
    <Link
      href={issue.url}
      className={cn("group block", className)}
      style={{ ["--issue-accent" as string]: issue.themeColor }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted transition-shadow duration-300 group-hover:shadow-[0_12px_40px_-12px_var(--issue-accent)]">
        <Image
          src={issue.cover}
          alt={`جلد شمارهٔ ${issue.number}`}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <p className="mt-3 font-mono text-sm font-bold" dir="ltr">
        {issue.number}
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
