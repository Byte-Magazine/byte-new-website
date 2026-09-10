"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface WorkshopSidebarProps {
  title: string;
  docs: Array<{ url: string; title: string }>;
}

/** Persistent lesson list for a workshop. */
export function WorkshopSidebar({ title, docs }: WorkshopSidebarProps) {
  const pathname = usePathname();
  const normalize = (value: string) => value.replace(/\/$/, "");

  return (
    <nav aria-label={`درس‌های ${title}`} className="text-sm">
      <p className="mb-3 font-bold">{title}</p>
      <ol className="space-y-1 border-s ps-3">
        {docs.map((doc, index) => {
          const active = normalize(pathname) === normalize(doc.url);
          return (
            <li key={doc.url}>
              <Link
                href={doc.url}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex gap-2 rounded-md px-2 py-1.5 leading-7 transition-colors",
                  active
                    ? "bg-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono text-xs opacity-60" dir="ltr">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{doc.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
