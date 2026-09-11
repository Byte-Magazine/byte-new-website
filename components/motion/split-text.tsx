"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Reveals a heading word by word.
 *
 * Splits on words rather than characters: Persian is a cursive script, and
 * splitting inside a word breaks the joining forms and makes the text
 * unreadable mid-animation.
 */
export function SplitText({
  text,
  className,
  wordClassName,
  stagger = 55,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  stagger?: number;
  /** Extra ms before the first word starts revealing. */
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setShown(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduced]);

  const visible = reduced || shown;
  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("inline", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <span
            style={{
              transitionDelay: visible
                ? `${delay + index * stagger}ms`
                : undefined,
            }}
            className={cn(
              "inline-block transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-[0.9em] opacity-0",
              wordClassName,
            )}
          >
            {word}
          </span>
          {index < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </span>
  );
}
