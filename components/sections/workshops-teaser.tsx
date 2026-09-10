import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Workshop } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";

export function WorkshopsTeaser({ workshops }: { workshops: Workshop[] }) {
  if (workshops.length === 0) return null;

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black">کارگاه‌ها</h2>
          <Link
            href="/workshops"
            className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            همه
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&:has(>li:only-child)]:lg:grid-cols-2">
          {workshops.map((workshop) => (
            <li key={workshop.slug}>
              <Link
                href={workshop.docs[0]?.url ?? workshop.url}
                className="group flex h-full flex-col rounded-xl border bg-card p-5 transition-colors hover:border-accent"
              >
                <span className="text-lg font-bold">{workshop.title}</span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {toPersianDigits(workshop.docs.length)} درس
                </span>
                <span className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">
                  {workshop.description ||
                    workshop.docs
                      .slice(0, 3)
                      .map((doc) => doc.title)
                      .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
