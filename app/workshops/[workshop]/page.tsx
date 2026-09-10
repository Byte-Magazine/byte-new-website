import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAllWorkshops, getWorkshop } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWorkshops().map((workshop) => ({ workshop: workshop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workshop: string }>;
}): Promise<Metadata> {
  const { workshop: slug } = await params;
  const workshop = getWorkshop(slug);
  if (!workshop) return {};

  return buildMetadata({
    title: workshop.title,
    description: workshop.description,
    path: workshop.url,
  });
}

/** Workshop index. Preserves the legacy /workshops/<slug> landing page. */
export default async function WorkshopPage({
  params,
}: {
  params: Promise<{ workshop: string }>;
}) {
  const { workshop: slug } = await params;
  const workshop = getWorkshop(slug);
  if (!workshop) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/workshops" className="hover:text-foreground">
          کارگاه‌ها
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-black md:text-4xl">{workshop.title}</h1>
        {workshop.description ? (
          <p className="mt-4 text-lg leading-9 text-muted-foreground">
            {workshop.description}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-muted-foreground">
          {toPersianDigits(workshop.docs.length)} درس
        </p>
      </header>

      <ol className="divide-y border-y">
        {workshop.docs.map((doc, index) => (
          <li key={doc.url}>
            <Link
              href={doc.url}
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-muted/40"
            >
              <span
                className="w-8 shrink-0 text-center font-mono text-sm text-muted-foreground"
                dir="ltr"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold leading-8 group-hover:underline">
                  {doc.title}
                </span>
                {doc.description ? (
                  <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">
                    {doc.description}
                  </span>
                ) : null}
              </span>
              <ArrowLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1" />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
