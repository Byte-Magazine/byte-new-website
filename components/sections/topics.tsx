import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import type { Tag } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";

/**
 * The subjects Byte writes about, sized by how much has been written.
 * A tag cloud earns its place here: the relative sizes are real data.
 */
export function Topics({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;

  const max = tags[0].count;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">موضوع‌ها</h2>
          <p className="mt-2 text-muted-foreground">
            اندازهٔ هر برچسب به تعداد مطالب آن است.
          </p>
        </div>
        <Link
          href="/tags"
          className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          همه
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </Reveal>

      <Reveal delay={120}>
        <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-3">
          {tags.map((tag) => {
            // Map counts onto a restrained range: a cloud where the largest
            // term dwarfs the rest becomes unreadable.
            const weight = tag.count / max;
            const size = 0.95 + weight * 0.85;
            return (
              <li key={tag.slug}>
                <Link
                  href={tag.url}
                  style={{ fontSize: `${size}rem` }}
                  prefetch={false}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  {tag.name}
                  <span className="ms-1 align-super text-[0.62rem] opacity-60">
                    {toPersianDigits(tag.count)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
