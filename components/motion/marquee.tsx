"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Continuous horizontal scroll. Pauses on hover and when the viewer has asked
 * for reduced motion, where it becomes an ordinary scrollable row.
 */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds for one full pass. */
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex overflow-x-auto motion-safe:overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          style={{ animationDuration: `${duration}s` }}
          className={cn(
            "flex shrink-0 items-center gap-3 pe-3",
            "motion-safe:animate-marquee group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
