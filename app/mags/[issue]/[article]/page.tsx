import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ArticleCard, articleAssetBase } from "@/components/cards/article-card";
import { AuthorList } from "@/components/content/author-list";
import { IssueNav } from "@/components/content/issue-nav";
import { MetaLine } from "@/components/content/meta-line";
import { TableOfContents } from "@/components/content/table-of-contents";
import { TagList } from "@/components/content/tag-list";
import MdxContent from "@/components/mdx-content";
import { Reveal } from "@/components/motion/reveal";
import {
  getAdjacentArticles,
  getAllArticles,
  getArticle,
  getRelatedArticles,
} from "@/lib/content";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";
import { issueAccentVars } from "@/lib/brand";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  JsonLd,
  ogImage,
} from "@/lib/seo";
import { extractHeadings } from "@/lib/mdx/headings";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({
    issue: article.issueNumber,
    article: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issue: string; article: string }>;
}): Promise<Metadata> {
  const { issue, article: slug } = await params;
  const article = getArticle(issue, slug);
  if (!article) return {};

  return buildMetadata({
    title: article.title,
    description: article.description,
    path: article.url,
    image: ogImage.article(article.issueNumber, article.slug),
    type: "article",
    publishedTime: article.date,
    authors: article.authors.map((a) => a.name),
    tags: article.tags,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ issue: string; article: string }>;
}) {
  const { issue, article: slug } = await params;
  const article = getArticle(issue, slug);
  if (!article) notFound();

  const headings = extractHeadings(article.body);
  const related = getRelatedArticles(article, 3);
  const { prev, next } = getAdjacentArticles(article);

  const issueArticles = article.issue.articles.map((item) => ({
    url: item.url,
    title: item.title,
  }));

  return (
    <main
      className="mx-auto max-w-7xl px-4 py-10"
      style={issueAccentVars(article.issue.themeColor) as React.CSSProperties}
    >
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.description,
          url: article.url,
          date: article.date,
          authors: article.authors.map((a) => ({ name: a.name, url: a.url })),
          tags: article.tags,
          issue: { number: article.issueNumber, url: article.issue.url },
        })}
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "آرشیو بایت", url: "/mags/intro" },
          { name: `شمارهٔ ${article.issueNumber}`, url: article.issue.url },
          { name: article.title, url: article.url },
        ])}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/mags/intro" className="hover:text-foreground">
          آرشیو
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={article.issue.url}
          className="hover:text-foreground"
        >
          <span dir="ltr" className="font-mono">
            {article.issueNumber}
          </span>
        </Link>
      </nav>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
        {/* Issue contents: start side, matching the workshop lesson list. */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto scroll-subtle pb-6">
            <IssueNav
              issueNumber={article.issueNumber}
              issueUrl={article.issue.url}
              description={article.issue.description}
              articles={issueArticles}
            />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-8 border-b pb-8">
            <h1 className="text-balance text-3xl font-black leading-[1.6] md:text-[2.1rem]">
              {article.title}
            </h1>

            {article.description ? (
              <p className="mt-4 text-lg leading-9 text-muted-foreground">
                {article.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <AuthorList authors={article.authors} />
              <MetaLine
                items={[
                  <time key="date" dateTime={article.date}>
                    {formatJalaliLong(article.date)}
                  </time>,
                  `${toPersianDigits(article.readingTime)} دقیقه مطالعه`,
                ]}
              />
            </div>
          </header>

          {/* Both rails collapse into disclosures on small screens. */}
          <div className="mb-8 grid gap-3 lg:hidden">
            <details className="rounded-lg border bg-muted/40 p-4">
              <summary className="cursor-pointer font-bold">
                مطالب این شماره
              </summary>
              <div className="mt-3">
                <IssueNav
                  issueNumber={article.issueNumber}
                  issueUrl={article.issue.url}
                  description={article.issue.description}
                  articles={issueArticles}
                />
              </div>
            </details>

            {headings.length >= 2 ? (
              <details className="rounded-lg border bg-muted/40 p-4">
                <summary className="cursor-pointer font-bold">
                  فهرست مطلب
                </summary>
                <div className="mt-3">
                  <TableOfContents headings={headings} />
                </div>
              </details>
            ) : null}
          </div>

          <div className="prose max-w-none">
            <MdxContent
              source={article.body}
              baseUrl={articleAssetBase(article)}
            />
          </div>

          <TagList tags={article.tags} className="mt-10" />

          {prev || next ? (
            <nav
              className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
              aria-label="مطالب این شماره"
            >
              {prev ? (
                <Link
                  href={prev.url}
                  className="group rounded-lg border p-4 transition-colors hover:border-issue"
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowRight className="size-3.5" />
                    قبلی
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
                  className="group rounded-lg border p-4 text-end transition-colors hover:border-issue"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    بعدی
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

        {/* Section headings: end side. */}
        {headings.length >= 2 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto scroll-subtle pb-6">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-xl font-bold">مطالب مرتبط</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <li key={item.url}>
                <Reveal delay={index * 70}>
                  <ArticleCard article={item} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
