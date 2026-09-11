"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/mdx/headings";
import { cn } from "@/lib/utils";

/**
 * Reading rail. Highlights the section currently in view.
 *
 * Tracking is done by measuring heading positions on scroll rather than with
 * IntersectionObserver: an observer only reports headings that are inside the
 * viewport, so scrolling through a long section — or past the last heading —
 * left nothing selected.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      // The heading nearest the top of the viewport, counting one that has
      // just scrolled above it as still current.
      const offset = 120;
      let current = headings[0]?.id ?? "";

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) {
          current = heading.id;
        } else {
          break;
        }
      }

      // At the very bottom the last section is current even if its heading
      // never reaches the offset, which happens for a short final section.
      const scrollBottom = window.scrollY + window.innerHeight;
      if (scrollBottom >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1].id;
      }

      setActiveId(current);
    };

    const onScroll = () => {
      // Coalesce to one measurement per frame.
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  const onClick = (event: React.MouseEvent, id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    // Scroll manually so the sticky header never covers the heading, and set
    // the hash without letting the browser jump first.
    event.preventDefault();
    setActiveId(id);
    element.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="فهرست مطالب" className="text-sm">
      <p className="mb-3 font-bold">در این مطلب</p>
      <ul className="space-y-0.5 border-s">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(event) => onClick(event, heading.id)}
                aria-current={active ? "location" : undefined}
                className={cn(
                  // The active marker sits on the rail itself, so the eye can
                  // track position without reading the labels.
                  "-ms-px block border-s-2 py-1.5 leading-6 transition-colors",
                  heading.level === 3 ? "ps-7" : "ps-4",
                  active
                    ? "border-issue font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
