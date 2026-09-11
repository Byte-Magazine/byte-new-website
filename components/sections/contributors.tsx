import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import type { Author } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";

function Chip({ author }: { author: Author }) {
  return (
    <Link
      href={author.url}
      className="flex items-center gap-2.5 rounded-full border bg-card py-1.5 pe-4 ps-1.5 transition-colors hover:border-accent"
    >
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
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
      <span className="whitespace-nowrap text-sm font-medium">
        {author.name}
      </span>
      <span className="text-xs text-muted-foreground">
        {toPersianDigits(author.articleCount)}
      </span>
    </Link>
  );
}

/**
 * Two rows of contributors drifting in opposite directions. The motion is
 * ambient rather than informational, so it pauses on hover and stops entirely
 * under reduced motion, where it becomes a normal scrollable row.
 */
export function Contributors({
  authors,
  totalAuthors,
}: {
  authors: Author[];
  totalAuthors: number;
}) {
  if (authors.length === 0) return null;

  const half = Math.ceil(authors.length / 2);
  const rows = [authors.slice(0, half), authors.slice(half)];

  return (
    <section className="py-20">
      <div className="mx-auto mb-8 flex max-w-6xl items-end justify-between gap-4 px-4">
        <Reveal>
          <h2 className="text-2xl font-black">نویسندگان</h2>
        </Reveal>
        <Link
          href="/authors"
          className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          هر {toPersianDigits(totalAuthors)} نفر
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <Marquee
            key={index}
            duration={index === 0 ? 52 : 64}
            reverse={index === 1}
          >
            {row.map((author) => (
              <Chip key={author.id} author={author} />
            ))}
          </Marquee>
        ))}
      </div>
    </section>
  );
}
