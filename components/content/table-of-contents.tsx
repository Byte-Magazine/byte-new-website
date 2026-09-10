"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/toc";
import { cn } from "@/lib/utils";

/**
 * Reading rail. Highlights the section currently in view, which is the one
 * piece of state a long Persian article genuinely benefits from.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="فهرست مطالب" className="text-sm">
      <p className="mb-3 font-bold">در این مطلب</p>
      <ul className="space-y-2 border-s ps-4">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "ps-3" : ""}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block leading-6 transition-colors",
                activeId === heading.id
                  ? "font-semibold text-issue"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
