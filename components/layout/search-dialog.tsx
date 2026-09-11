"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchDocs, type SearchDoc, type SearchKind } from "@/lib/search";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<SearchKind, string> = {
  article: "مقاله‌ها",
  blog: "وبلاگ",
  workshop: "کارگاه‌ها",
  author: "نویسندگان",
  issue: "شماره‌ها",
};

const GROUP_ORDER: SearchKind[] = [
  "article",
  "blog",
  "workshop",
  "issue",
  "author",
];

/** Fetched once per session and shared across every dialog mount. */
let indexCache: SearchDoc[] | null = null;
let indexRequest: Promise<SearchDoc[]> | null = null;

function loadIndex(): Promise<SearchDoc[]> {
  if (indexCache) return Promise.resolve(indexCache);
  indexRequest ??= fetch("/search-index.json")
    .then((response) => (response.ok ? response.json() : []))
    .then((docs: SearchDoc[]) => {
      indexCache = docs;
      return docs;
    })
    .catch(() => []);
  return indexRequest;
}

/**
 * Site-wide search.
 *
 * Built on the plain Dialog rather than cmdk: cmdk depends on Radix's dialog,
 * which conflicts with the Base UI primitives this project uses and throws at
 * runtime. The list behaviour here is small enough to own.
 */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(indexCache !== null);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;

    let cancelled = false;
    void loadIndex().then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  const grouped = useMemo(() => {
    const docs = loaded ? (indexCache ?? []) : [];
    const results = searchDocs(docs, query, 24);

    const map = new Map<SearchKind, SearchDoc[]>();
    for (const doc of results) {
      const list = map.get(doc.kind) ?? [];
      list.push(doc);
      map.set(doc.kind, list);
    }
    return GROUP_ORDER.filter((kind) => map.has(kind)).map((kind) => ({
      kind,
      docs: map.get(kind)!,
    }));
  }, [loaded, query]);

  /** Flattened in render order, so arrow keys follow what is on screen. */
  const flat = useMemo(() => grouped.flatMap((group) => group.docs), [grouped]);

  const go = useCallback(
    (url: string) => {
      setOpen(false);
      setQuery("");
      router.push(url);
    },
    [router],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, flat.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && flat[active]) {
      event.preventDefault();
      go(flat[active].url);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  /** Flat position of each result, so keyboard order matches render order. */
  const positions = useMemo(() => {
    const map = new Map<string, number>();
    flat.forEach((doc, position) => map.set(doc.url, position));
    return map;
  }, [flat]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="جست‌وجو"
        onClick={() => setOpen(true)}
      >
        <Search className="size-[1.1rem]" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[12vh] w-full max-w-xl translate-y-0 gap-0 rounded-xl p-0 sm:max-w-xl"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>جست‌وجو</DialogTitle>
            <DialogDescription>
              جست‌وجو در مقاله‌ها، نویسندگان و شماره‌ها
            </DialogDescription>
          </DialogHeader>

          <div className="border-b p-3">
            <Input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="جست‌وجو…"
              aria-label="جست‌وجو"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="scroll-subtle max-h-[60vh] overflow-y-auto p-2">
            {!loaded ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                در حال بارگذاری…
              </p>
            ) : null}

            {loaded && !query.trim() ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                نام مقاله، نویسنده یا موضوع را بنویسید.
              </p>
            ) : null}

            {loaded && query.trim() && flat.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                چیزی پیدا نشد.
              </p>
            ) : null}

            <ul ref={listRef} role="listbox" aria-label="نتایج جست‌وجو">
              {grouped.map((group) => (
                <li key={group.kind}>
                  <p className="px-3 pb-1 pt-3 text-xs font-bold text-muted-foreground">
                    {GROUP_LABELS[group.kind]}
                  </p>
                  <ul>
                    {group.docs.map((doc) => {
                      const position = positions.get(doc.url) ?? 0;
                      const isActive = position === active;
                      return (
                        <li key={doc.url}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            data-active={isActive}
                            onClick={() => go(doc.url)}
                            onMouseMove={() => setActive(position)}
                            className={cn(
                              "flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-start transition-colors",
                              isActive ? "bg-muted" : "hover:bg-muted/60",
                            )}
                          >
                            <span className="font-medium">{doc.title}</span>
                            {doc.description ? (
                              <span className="line-clamp-1 text-xs text-muted-foreground">
                                {doc.description}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
