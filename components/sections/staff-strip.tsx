import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Author } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";

/**
 * A quiet row of contributor faces. Deliberately not an auto-scrolling
 * marquee: continuous motion competes with the hero and cannot be paused.
 */
export function StaffStrip({
  authors,
  totalAuthors,
}: {
  authors: Author[];
  totalAuthors: number;
}) {
  if (authors.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">نویسندگان</h2>
        <Link
          href="/authors"
          className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          هر {toPersianDigits(totalAuthors)} نفر
          <ArrowLeft className="size-4" />
        </Link>
      </div>

      <ul className="flex flex-wrap gap-3">
        {authors.map((author) => (
          <li key={author.id}>
            <Link
              href={author.url}
              className="flex items-center gap-2.5 rounded-full border bg-card py-1.5 pe-4 ps-1.5 transition-colors hover:border-accent"
            >
              <span className="relative size-8 overflow-hidden rounded-full bg-muted">
                {author.image ? (
                  <Image
                    src={author.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    {author.name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="text-sm font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">
                {toPersianDigits(author.articleCount)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
