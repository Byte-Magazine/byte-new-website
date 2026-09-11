"use client";

import { useEffect, useRef, useState } from "react";

import ScrollVelocity from "./scroll-velocity";
import { cn } from "@/lib/utils";

/**
 * Section separator: an oversized wordmark ribbon whose speed is driven by
 * scroll velocity — flick the page and it races, rest and it drifts.
 *
 * The type is outlined rather than filled. At this size a solid band would
 * out-shout the section headings around it; hollow letterforms read as texture
 * and leave the hierarchy intact.
 *
 * Latin, because it is a wordmark ribbon rather than body copy: Persian
 * joined forms do not survive being tracked out this far.
 */
export function VelocityDivider({
  className,
  velocity = 30,
  text = "A Bite Into Tech ·",
}: {
  className?: string;
  /** Base drift in px/s before scroll velocity is folded in. */
  velocity?: number;
  text?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimated(!still.matches);
    sync();
    still.addEventListener("change", sync);
    return () => still.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;

    // The component measures scroll velocity for as long as it is mounted, so
    // without this each divider would keep working while parked far offscreen.
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const rowClass = cn(
    // pe-* is the gap between repetitions: the component only appends a
    // single space, which runs the copies together at this size.
    "pe-8 text-2xl font-black uppercase leading-[1.3] tracking-tight sm:pe-10 sm:text-3xl md:pe-12 md:text-4xl",
    "text-transparent [-webkit-text-stroke:1.5px_color-mix(in_oklch,var(--accent)_70%,transparent)]",
  );

  return (
    <div
      ref={hostRef}
      aria-hidden
      dir="ltr"
      className={cn(
        "relative overflow-hidden border-y bg-muted/20 py-6 md:py-8",
        // Dissolve both ends so the ribbon never collides with the edge.
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      {animated && visible ? (
        // Two rows travelling opposite ways: one row reads as a marquee, two
        // crossing rows read as motion with a direction of its own.
        <ScrollVelocity
          texts={[text, text]}
          velocity={velocity}
          numCopies={6}
          className={rowClass}
          parallaxClassName="py-1"
        />
      ) : (
        <div className={cn(rowClass, "truncate text-center")}>{text}</div>
      )}
    </div>
  );
}
