"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Tilts toward the pointer. Used for issue covers, where the physical
 * metaphor of a magazine held at an angle fits the content.
 */
export function TiltCard({
  children,
  className,
  strength = 9,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  strength?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`;
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn(
        "transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none! motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
