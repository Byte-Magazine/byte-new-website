"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchDocs, type SearchDoc, type SearchKind } from "@/lib/search";

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

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (!open || indexCache) return;
    setLoading(true);
    void loadIndex().then((loaded) => {
      setDocs(loaded);
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (open && indexCache) setDocs(indexCache);
  }, [open]);

  const grouped = useMemo(() => {
    const results = searchDocs(docs, query, 24);
    const map = new Map<SearchKind, SearchDoc[]>();
    for (const doc of results) {
      const list = map.get(doc.kind) ?? [];
      list.push(doc);
      map.set(doc.kind, list);
    }
    return map;
  }, [docs, query]);

  const go = useCallback(
    (url: string) => {
      setOpen(false);
      setQuery("");
      router.push(url);
    },
    [router],
  );

  const hasResults = grouped.size > 0;

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

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="جست‌وجو"
        description="جست‌وجو در مقاله‌ها، نویسندگان و شماره‌ها"
      >
        <CommandInput
          placeholder="جست‌وجو…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              در حال بارگذاری…
            </div>
          ) : null}

          {!loading && query.trim() && !hasResults ? (
            <CommandEmpty>چیزی پیدا نشد.</CommandEmpty>
          ) : null}

          {!loading && !query.trim() ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              نام مقاله، نویسنده یا موضوع را بنویسید.
            </div>
          ) : null}

          {GROUP_ORDER.filter((kind) => grouped.has(kind)).map((kind) => (
            <CommandGroup key={kind} heading={GROUP_LABELS[kind]}>
              {grouped.get(kind)!.map((doc) => (
                <CommandItem
                  key={doc.url}
                  value={doc.url}
                  onSelect={() => go(doc.url)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{doc.title}</span>
                  {doc.description ? (
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {doc.description}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
