"use client";

import { useEffect, useMemo, useState } from "react";

import { useReducedMotion } from "./use-reduced-motion";

/**
 * Resolves a binary issue number one bit at a time.
 *
 * The publication names its issues in binary, so the hero's motion comes from
 * that identity rather than from a generic particle field. Runs once on load.
 */
export function BinaryDecrypt({
  value,
  className,
  bitDelay = 90,
}: {
  value: string;
  className?: string;
  bitDelay?: number;
}) {
  const reduced = useReducedMotion();

  // Server and first client render show the real value, so hydration matches;
  // the scramble only appears once the timer starts.
  const [revealed, setRevealed] = useState(value.length);

  // Deterministic filler derived from the value, so no randomness runs during
  // render and the markup is stable.
  const scramble = useMemo(
    () => value.split("").map((_, index) => (index % 2 === 0 ? "1" : "0")),
    [value],
  );

  useEffect(() => {
    if (reduced) return;

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setRevealed(index);
      if (index >= value.length) clearInterval(timer);
    }, bitDelay);

    // Begin scrambled on the next frame, after hydration has settled.
    const start = requestAnimationFrame(() => setRevealed(0));

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(start);
    };
  }, [value, bitDelay, reduced]);

  return (
    <span className={className} dir="ltr" aria-label={value}>
      {value.split("").map((bit, index) => (
        <span
          key={index}
          aria-hidden
          className={
            index < revealed
              ? "text-foreground transition-colors duration-300"
              : "text-muted-foreground/35"
          }
        >
          {index < revealed ? bit : (scramble[index] ?? bit)}
        </span>
      ))}
    </span>
  );
}
