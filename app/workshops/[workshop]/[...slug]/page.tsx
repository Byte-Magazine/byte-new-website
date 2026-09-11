import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { AuthorList } from "@/components/content/author-list";
import { TableOfContents } from "@/components/content/table-of-contents";
import MdxContent from "@/components/mdx-content";
import { WorkshopSidebar } from "@/components/workshops/workshop-sidebar";
import { getAllWorkshops, getWorkshop, getWorkshopDoc } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { extractHeadings } from "@/lib/mdx/headings";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWorkshops().flatMap((workshop) =>
    workshop.docs.map((doc) => ({
      workshop: workshop.slug,
      slug: [doc.slug],
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workshop: string; slug: string[] }>;
}): Promise<Metadata> {
  const { workshop, slug } = await params;
  const doc = getWorkshopDoc(workshop, slug.join("/"));
  if (!doc) return {};

  return buildMetadata({
    title: doc.title,
    description: doc.description,
    path: doc.url,
  });
}

export default async function WorkshopDocPage({
  params,
}: {
  params: Promise<{ workshop: string; slug: string[] }>;
}) {
  const { workshop: workshopSlug, slug } = await params;
  const workshop = getWorkshop(workshopSlug);
  const doc = getWorkshopDoc(workshopSlug, slug.join("/"));
  if (!workshop || !doc) notFound();

  const index = workshop.docs.findIndex((item) => item.url === doc.url);
  const prev = index > 0 ? workshop.docs[index - 1] : undefined;
  const next =
    index < workshop.docs.length - 1 ? workshop.docs[index + 1] : undefined;

  const headings = extractHeadings(doc.body);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/workshops" className="hover:text-foreground">
          کارگاه‌ها
        </Link>
        <span>/</span>
        <span>{workshop.title}</span>
      </nav>

      <div className="lg:flex lg:gap-12">
        <aside className="mb-8 shrink-0 lg:mb-0 lg:w-60">
          <div className="lg:sticky lg:top-20">
            <WorkshopSidebar
              title={workshop.title}
              docs={workshop.docs.map((item) => ({
                url: item.url,
                title: item.title,
              }))}
            />
          </div>
        </aside>

        <article className="min-w-0 flex-1" data-iv="article">
          <header className="mb-8 border-b pb-6">
            <h1 className="text-balance text-3xl font-black leading-[1.6]">
              {doc.title}
            </h1>
            {doc.description ? (
              <p
                data-iv="subtitle"
                className="mt-3 text-lg leading-9 text-muted-foreground"
              >
                {doc.description}
              </p>
            ) : null}
            {doc.authors.length > 0 ? (
              <div className="mt-5">
                <AuthorList authors={doc.authors} />
              </div>
            ) : null}
          </header>

          <div className="prose max-w-none" data-iv="body">
            <MdxContent
              source={doc.body}
              baseUrl={`/content/workshops/${workshop.slug}/${doc.slug}`}
            />
          </div>

          {prev || next ? (
            <nav
              data-iv="ignore"
              className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
              aria-label="درس‌های کارگاه"
            >
              {prev ? (
                <Link
                  href={prev.url}
                  className="rounded-lg border p-4 transition-colors hover:border-accent"
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowRight className="size-3.5" />
                    درس قبل
                  </span>
                  <span className="mt-1 block font-medium leading-7">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={next.url}
                  className="rounded-lg border p-4 text-end transition-colors hover:border-accent"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    درس بعد
                    <ArrowLeft className="size-3.5" />
                  </span>
                  <span className="mt-1 block font-medium leading-7">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </article>

        {headings.length >= 2 ? (
          <aside className="hidden w-56 shrink-0 xl:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto scroll-subtle">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
