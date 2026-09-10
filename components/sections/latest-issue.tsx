import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MetaLine } from "@/components/content/meta-line";
import type { Issue } from "@/lib/content";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";

export function LatestIssue({ issue }: { issue: Issue }) {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-20"
      style={{ ["--issue-accent" as string]: issue.themeColor }}
    >
      <div className="grid items-center gap-10 md:grid-cols-[1fr_minmax(0,20rem)]">
        <div className="order-2 md:order-1">
          <p className="font-mono text-sm text-muted-foreground">
            <span dir="ltr">{issue.number}</span>
          </p>
          <h2 className="mt-2 text-3xl font-black">{issue.description}</h2>
          <MetaLine
            className="mt-3"
            items={[
              <time key="date" dateTime={issue.date}>
                {formatJalaliLong(issue.date)}
              </time>,
              `${toPersianDigits(issue.articleCount)} مطلب`,
            ]}
          />

          <ol className="mt-6 space-y-1.5 text-sm">
            {issue.articles.slice(0, 5).map((article) => (
              <li key={article.url}>
                <Link
                  href={article.url}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              render={
                <Link href={issue.url}>
                  فهرست کامل
                  <ArrowLeft className="size-4" />
                </Link>
              }
            />
            <Button
              variant="outline"
              render={
                <a href={issue.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-4" />
                  پی‌دی‌اف
                </a>
              }
            />
          </div>
        </div>

        <Link href={issue.url} className="group order-1 block md:order-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border shadow-[0_20px_60px_-24px_var(--issue-accent)] transition-transform duration-500 group-hover:-translate-y-1">
            <Image
              src={issue.cover}
              alt={`جلد شمارهٔ ${issue.number}`}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 20rem"
              className="object-cover"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
