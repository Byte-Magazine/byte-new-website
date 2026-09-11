"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { IssueCard } from "@/components/cards/issue-card";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { useThemeStore } from "@/lib/stores/theme";

const CircularGallery = dynamic(
  () => import("@/components/motion/circular-gallery"),
  { ssr: false },
);

/** Serialisable issue data; the gallery only needs the cover and a label. */
export interface WallIssue {
  number: string;
  url: string;
  cover: string;
  description: string;
  date: string;
  themeColor: string;
  articleCount: number;
}

/**
 * The archive, as a curved carousel of covers that responds to drag and wheel.
 *
 * The covers are the archive's identity, so they are given room to be the
 * subject rather than being reduced to a row of thumbnails. The carousel needs
 * WebGL, so a plain grid renders whenever that is unavailable — on a narrow
 * screen, under reduced motion, or before hydration — and every issue stays
 * reachable as a real link either way.
 */
export function IssueWall({ issues }: { issues: WallIssue[] }) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(wide.matches && !still.matches);

    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  if (issues.length === 0) return null;

  const items = issues.map((issue) => ({
    image: issue.cover,
    text: issue.number,
  }));

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 pb-2 pt-14">
        <Reveal className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">آرشیو</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              برای گشتن بین شماره‌ها بکشید یا اسکرول کنید.
            </p>
          </div>
          <Link
            href="/mags/intro"
            className="group flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            آرشیو کامل
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>
      </div>

      {enabled ? (
        <>
          <div className="-mt-14 h-92 w-full md:-mt-16 md:h-108">
            <CircularGallery
              items={items}
              bend={2.4}
              textColor={resolvedTheme === "dark" ? "#e7eaf2" : "#1b1f2a"}
              borderRadius={0.05}
              scrollEase={0.05}
            />
          </div>

          {/* The canvas is not focusable, so the issues are also listed as
              plain links; this is the keyboard and screen-reader path. */}
          <nav
            aria-label="شماره‌ها"
            className="mx-auto max-w-6xl px-4 pb-14 pt-2"
          >
            <ul className="flex flex-wrap justify-center gap-2">
              {issues.map((issue) => (
                <li key={issue.number}>
                  <Link
                    href={issue.url}
                    className="block rounded-md border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                  >
                    <span dir="ltr">{issue.number}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pb-16">
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
      )}
    </section>
  );
}
