import Link from "next/link";

import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Wordmark. The binary suffix is the publication's identity, so it is set in
 * the mono face and kept LTR.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex items-baseline gap-2", className)}
      aria-label={SITE.name}
    >
      <span className="text-lg font-black tracking-tight">بایت</span>
      <span
        dir="ltr"
        className="font-mono text-[0.7rem] text-muted-foreground transition-colors group-hover:text-accent"
      >
        01000010
      </span>
    </Link>
  );
}
