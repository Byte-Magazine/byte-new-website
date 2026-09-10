import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  Info,
  Lightbulb,
  OctagonAlert,
  StickyNote,
} from "lucide-react";

import { cn } from "@/lib/utils";

const callout = cva(
  "my-6 rounded-lg border border-s-[3px] px-4 py-3 text-[0.97rem] leading-[1.9] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
  {
    variants: {
      type: {
        note: "border-border border-s-muted-foreground bg-muted/50",
        info: "border-info/25 border-s-info bg-info/[0.07]",
        tip: "border-success/25 border-s-success bg-success/[0.07]",
        warning: "border-warning/30 border-s-warning bg-warning/[0.09]",
        danger: "border-destructive/25 border-s-destructive bg-destructive/[0.07]",
      },
    },
    defaultVariants: { type: "note" },
  },
);

const ICONS = {
  note: StickyNote,
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  danger: OctagonAlert,
} as const;

const DEFAULT_TITLES: Record<keyof typeof ICONS, string> = {
  note: "یادداشت",
  info: "اطلاعات",
  tip: "نکته",
  warning: "هشدار",
  danger: "خطر",
};

const ICON_COLORS: Record<keyof typeof ICONS, string> = {
  note: "text-muted-foreground",
  info: "text-info",
  tip: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
};

export interface CalloutProps extends VariantProps<typeof callout> {
  title?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Replaces Docusaurus admonitions. Unlike the original it themes correctly in
 * both light and dark and places its border on the inline start, so the accent
 * sits on the right in RTL.
 */
export function Callout({ type, title, children, className }: CalloutProps) {
  const key = (type ?? "note") as keyof typeof ICONS;
  const Icon = ICONS[key];
  const heading = title?.trim() || DEFAULT_TITLES[key];

  return (
    <aside className={cn(callout({ type }), className)}>
      <p className="mb-1.5 flex items-center gap-2 font-bold">
        <Icon className={cn("size-4 shrink-0", ICON_COLORS[key])} aria-hidden />
        {heading}
      </p>
      <div className="text-foreground/90">{children}</div>
    </aside>
  );
}

export default Callout;
