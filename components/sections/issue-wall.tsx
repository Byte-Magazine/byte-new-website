import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IssueCard } from "@/components/cards/issue-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import type { Issue } from "@/lib/content";

/** Every issue cover in one wall; the colours carry the archive's identity. */
export function IssueWall({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black">آرشیو</h2>
          <Link
            href="/mags/intro"
            className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            آرشیو کامل
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4 lg:grid-cols-8">
          {issues.map((issue, index) => (
            <Reveal key={issue.number} delay={index * 55}>
              <TiltCard strength={7}>
                <IssueCard issue={issue} />
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
