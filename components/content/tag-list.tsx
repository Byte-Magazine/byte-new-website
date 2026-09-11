import Link from "next/link";

import { tagSlug } from "@/lib/content";
import { cn } from "@/lib/utils";

export function TagList({
  tags,
  className,
}: {
  tags: string[];
  className?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={`/tags/${tagSlug(tag)}`}
            prefetch={false}
            className="inline-block rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-issue hover:text-foreground"
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
