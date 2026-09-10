import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IssueCard } from "@/components/cards/issue-card";
import type { Issue } from "@/lib/content";

/** Every issue cover in one wall; the colours carry the archive's identity. */
export function IssueWall({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black">آرشیو</h2>
          <Link
            href="/mags/intro"
            className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            آرشیو کامل
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-8">
          {issues.map((issue) => (
            <IssueCard key={issue.number} issue={issue} />
          ))}
        </div>
      </div>
    </section>
  );
}
