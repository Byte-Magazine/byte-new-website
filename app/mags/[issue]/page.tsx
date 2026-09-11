import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { MetaLine } from "@/components/content/meta-line";
import { Button } from "@/components/ui/button";
import { getAllIssues, getIssue } from "@/lib/content";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";
import { buildMetadata, issueJsonLd, JsonLd, ogImage } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllIssues().map((issue) => ({ issue: issue.number }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ issue: string }>;
}): Promise<Metadata> {
  const { issue: number } = await params;
  const issue = getIssue(number);
  if (!issue) return {};

  return buildMetadata({
    title: `شمارهٔ ${number}`,
    description:
      issue.description || `${issue.description} نشریه‌ی بایت`.trim(),
    path: issue.url,
    image: ogImage.issue(issue.number),
  });
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ issue: string }>;
}) {
  const { issue: number } = await params;
  const issue = getIssue(number);
  if (!issue) notFound();

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-10"
      style={{ ["--issue-accent" as string]: issue.themeColor }}
    >
      <JsonLd
        data={issueJsonLd({
          number: issue.number,
          url: issue.url,
          date: issue.date,
          description: issue.description,
        })}
      />

      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/mags/intro" className="hover:text-foreground">
          آرشیو بایت
        </Link>
      </nav>

      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,18rem)_1fr]">
        {/* Sticks while the long article list scrolls past it. */}
        <div className="md:sticky md:top-20">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border shadow-[0_16px_48px_-20px_var(--issue-accent)]">
            <Image
              src={issue.cover}
              alt={`جلد شمارهٔ ${issue.number}`}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 18rem"
              className="object-cover"
            />
          </div>

          <Button
            render={
              <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="size-4" />
                دریافت پی‌دی‌اف
              </a>
            }
            className="mt-4 w-full"
          />
        </div>

        <div>
          <p className="font-mono text-sm text-muted-foreground">
            <span dir="ltr">{issue.number}</span>
          </p>
          <h1 className="mt-1 text-3xl font-black">{issue.description}</h1>
          <MetaLine
            className="mt-3"
            items={[
              <time key="date" dateTime={issue.date}>
                {formatJalaliLong(issue.date)}
              </time>,
              `${toPersianDigits(issue.articleCount)} مطلب`,
            ]}
          />

          <ol className="mt-8 divide-y border-y">
            {issue.articles.map((article, index) => (
              <li key={article.url}>
                <Link
                  href={article.url}
                  className="group flex gap-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <span
                    className="w-8 shrink-0 pt-1 text-center font-mono text-sm text-muted-foreground"
                    dir="ltr"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold leading-8 decoration-issue underline-offset-4 group-hover:underline">
                      {article.title}
                    </span>
                    {article.description ? (
                      <span className="mt-0.5 line-clamp-2 block text-sm leading-7 text-muted-foreground">
                        {article.description}
                      </span>
                    ) : null}
                    {article.authors.length > 0 ? (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {article.authors.map((a) => a.name).join("، ")}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}
