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

interface TooltipProps {
  tip: string;
  children: ReactNode;
}

const TRIGGER_CLASS =
  "cursor-help underline decoration-dotted decoration-from-font underline-offset-4 decoration-issue";

function TipText({ tip }: { tip: string }) {
  // Tips are Latin technical terms; keep them LTR inside RTL prose.
  return (
    <span dir="ltr" className="font-mono text-xs">
      {tip}
    </span>
  );
}

/**
 * Glossary tooltip used throughout the articles for Latin technical terms.
 *
 * The legacy implementation was hover-only, which made all 438 of its uses
 * unreachable on touch devices. This renders a tap-to-open popover when the
 * device has no fine pointer, and a hover tooltip when it does.
 */
export function Tooltip({ tip, children }: TooltipProps) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsTouch(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (isTouch) {
    return (
      <Popover>
        <PopoverTrigger
          className={TRIGGER_CLASS}
          aria-label={`توضیح: ${tip}`}
        >
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[16rem] px-3 py-1.5">
          <TipText tip={tip} />
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
