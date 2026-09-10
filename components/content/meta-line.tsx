import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a row of metadata items separated by a bullet.
 *
 * Each item is isolated so a Latin or numeric value cannot reorder the items
 * around it — the failure mode where "۳۱ شهریور ۱۴۰۴ · ۸ دقیقه" renders with
 * the number adrift.
 */
export function MetaLine({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  const visible = items.filter(Boolean);

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground",
        className,
      )}
    >
      {visible.map((item, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
          ) : null}
          <span className="isolate">{item}</span>
        </Fragment>
      ))}
    </p>
  );
}
