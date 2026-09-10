import Link from "next/link";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The Byte mark. Inlined as a path rather than an <img> so it inherits
 * currentColor and stays crisp in both themes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 561 561"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M82.8616 120.61H150.731V405.15C150.731 491.17 220.337 560.9 306.203 560.9H322.464C408.331 560.9 477.877 491.17 477.877 405.15V313.88C477.877 227.86 408.331 158.13 322.464 158.13H290.062V229.48H317.354C366.646 229.48 406.655 269.56 406.655 319V400.03C406.655 449.41 366.646 489.49 317.354 489.49H311.304C262.012 489.49 222.004 449.41 222.004 400.03V0H161.871L82.8516 79.23V120.61H82.8616Z" />
    </svg>
  );
}

/** Wordmark used in the header and footer. */
export function Logo({
  className,
  showBinary = true,
}: {
  className?: string;
  showBinary?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={SITE.name}
    >
      <LogoMark className="size-7 shrink-0 text-foreground transition-colors group-hover:text-accent" />
      <span className="flex items-baseline gap-2">
        <span className="text-lg font-black tracking-tight">بایت</span>
        {showBinary ? (
          <span
            dir="ltr"
            className="hidden font-mono text-[0.68rem] text-muted-foreground transition-colors group-hover:text-accent sm:inline"
          >
            01000010
          </span>
        ) : null}
      </span>
    </Link>
  );
}
