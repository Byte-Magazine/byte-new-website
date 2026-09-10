import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getAllWorkshops } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "کارگاه‌ها",
  description: "کارگاه‌های آموزشی نشریه‌ی بایت",
  path: "/workshops",
});

export default function WorkshopsPage() {
  const workshops = getAllWorkshops();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black md:text-4xl">کارگاه‌ها</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          آموزش‌های گام‌به‌گامی که در قالب کارگاه تهیه شده‌اند.
        </p>
      </header>

      <ul className="grid gap-4">
        {workshops.map((workshop) => (
          <li key={workshop.slug}>
            <Link
              href={workshop.docs[0]?.url ?? workshop.url}
              className="group flex items-center justify-between gap-4 rounded-xl border p-5 transition-colors hover:border-accent"
            >
              <span>
                <span className="block text-lg font-bold">
                  {workshop.title}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {toPersianDigits(workshop.docs.length)} درس
                </span>
              </span>
              <ArrowLeft className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
