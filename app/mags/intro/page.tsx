import type { Metadata } from "next";

import { IssueCard } from "@/components/cards/issue-card";
import { getAllIssues, getStats } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "آرشیو بایت",
  description: "همهٔ شماره‌های منتشرشدهٔ نشریه‌ی علمی فرهنگی بایت",
  path: "/mags/intro",
});

export default function MagsIntroPage() {
  const issues = getAllIssues();
  const stats = getStats();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12 max-w-3xl">
        <h1 className="text-3xl font-black md:text-4xl">آرشیو بایت</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          هر شماره با عددی دودویی نام‌گذاری می‌شود؛ از{" "}
          <span dir="ltr" className="font-mono">
            00000001
          </span>{" "}
          تا امروز. مجموعاً {toPersianDigits(stats.articles)} مطلب در{" "}
          {toPersianDigits(stats.issues)} شماره.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {issues.map((issue) => (
          <IssueCard key={issue.number} issue={issue} />
        ))}
      </div>
    </main>
  );
}
