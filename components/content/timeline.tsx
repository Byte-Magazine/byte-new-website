import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Vertical timeline for article content. The rail sits on the inline start so
 * it renders on the right in RTL.
 */
export function Timeline({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "not-prose my-6 space-y-6 border-s-2 border-border ps-6",
        className,
      )}
    >
      {children}
    </ol>
  );
}

export function TimelineItem({
  title,
  date,
  children,
}: {
  title?: string;
  date?: string;
  children?: ReactNode;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -inset-s-[1.9rem] top-2 size-2.5 -translate-x-1/2 rounded-full bg-issue"
        style={{ insetInlineStart: "-1.81rem" }}
        aria-hidden
      />
      {date ? (
        <p className="mb-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
          {date}
        </p>
      ) : null}
      {title ? <p className="font-bold">{title}</p> : null}
      <div className="text-[0.97rem] leading-[1.9] text-foreground/90">
        {children}
      </div>
    </li>
  );
}

export default Timeline;
