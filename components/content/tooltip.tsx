"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TooltipProps {
  tip: string;
  children: ReactNode;
  href?: string;
}

const TRIGGER_CLASS =
  "cursor-help underline decoration-dotted decoration-from-font underline-offset-4 decoration-issue";

function TipText({ tip }: { tip: string }) {
  const hasPersianText = /(?=\p{L})\p{Script=Arabic}/u.test(tip);

  return (
    <span
      dir={hasPersianText ? "rtl" : "ltr"}
      className={cn(
        "block text-start text-xs",
        hasPersianText ? "font-sans" : "font-mono",
      )}
    >
      {tip}
    </span>
  );
}

/**
 * Glossary tooltip used throughout the articles for Latin technical terms.
 *
 * The legacy implementation was hover-only, which made all 438 of its uses
 * unreachable on touch devices. Linked notes use a popover so the link can
 * receive focus, with hover enabled on devices that support it.
 */
export function Tooltip({ tip, children, href }: TooltipProps) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsTouch(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isTouch || href) {
    return (
      <Popover>
        <PopoverTrigger
          className={TRIGGER_CLASS}
          aria-label={`توضیح: ${tip}`}
          openOnHover={!isTouch}
        >
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[16rem] px-3 py-1.5">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              <TipText tip={tip} />
            </a>
          ) : (
            <TipText tip={tip} />
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <UiTooltip>
      <TooltipTrigger className={TRIGGER_CLASS} aria-label={`توضیح: ${tip}`}>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <TipText tip={tip} />
      </TooltipContent>
    </UiTooltip>
  );
}

export default Tooltip;
