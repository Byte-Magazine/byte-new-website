"use client";

import { useEffect, useRef, useState } from "react";

import { toPersianDigits } from "@/lib/persian";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Counts up to a value in Persian digits when scrolled into view.
 *
 * React Bits' CountUp renders Latin numerals via a spring on textContent, so
 * this drives its own interpolation and formats each frame instead.
 */
export function PersianCount({
  to,
  duration = 1400,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState(0);

  // With reduced motion the final value is shown directly; nothing animates,
  // so no state update is needed.
  const value = reduced ? to : animated;

  useEffect(() => {
    if (reduced) return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let start = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const step = (timestamp: number) => {
          start ||= timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          // Ease-out cubic: fast start, gentle settle.
          setAnimated(Math.round(to * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {toPersianDigits(value)}
    </span>
  );
}
