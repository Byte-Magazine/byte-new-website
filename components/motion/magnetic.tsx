"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "./use-reduced-motion";

/** Drifts slightly toward the pointer. For primary calls to action only. */
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn(
        "inline-block transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none! motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
