import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { getAllTags } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "برچسب‌ها",
  description: "همهٔ موضوع‌هایی که در نشریه‌ی بایت دربارهٔ آن‌ها نوشته‌ایم",
  path: "/tags",
});

export default function TagsPage() {
  const tags = getAllTags();
  const total = tags.reduce((sum, tag) => sum + tag.count, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black md:text-4xl">برچسب‌ها</h1>
        <p className="mt-4 max-w-xl text-lg leading-9 text-muted-foreground">
          {toPersianDigits(tags.length)} موضوع در {toPersianDigits(total)} مطلب.
          روی هر کدام بزنید تا نوشته‌هایش را ببینید.
        </p>
      </header>

      <Reveal>
        <ul className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li key={tag.slug}>
              {/* Prefetch is off: static export does not emit RSC payloads
                  for percent-encoded Persian slugs, so prefetching a wall of
                  them only produces 404 noise. */}
              <Link
                href={tag.url}
                prefetch={false}
                className="group flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-sm transition-colors hover:border-accent"
              >
                <span>{tag.name}</span>
                <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  {toPersianDigits(tag.count)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </main>
  );
}
