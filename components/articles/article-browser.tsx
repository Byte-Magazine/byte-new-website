"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import {
  ArticleSummary,
  type ArticleSummaryData,
} from "@/components/cards/article-summary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toPersianDigits } from "@/lib/persian";
import { searchDocs, type SearchDoc } from "@/lib/search";
import { cn } from "@/lib/utils";

/**
 * Serialisable article shape; bodies are never sent to the client.
 * Extends the card's data with the fields only filtering needs.
 */
export interface BrowserArticle extends ArticleSummaryData {
  date: string;
  authors: Array<{ id: string; name: string; image?: string }>;
}

interface Facet {
  value: string;
  label: string;
  count: number;
}

interface ArticleBrowserProps {
  articles: BrowserArticle[];
  tags: Facet[];
  authors: Facet[];
  issues: Facet[];
}

/** One filter group in the rail; collapses a long list behind a toggle. */
function FacetGroup({
  title,
  facets,
  selected,
  onToggle,
  mono,
  limit = 8,
}: {
  title: string;
  facets: Facet[];
  selected: string | null;
  onToggle: (value: string) => void;
  mono?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  if (facets.length === 0) return null;

  // A selected value must stay visible even if it sits past the cut-off.
  const visible = expanded
    ? facets
    : [
        ...facets.slice(0, limit),
        ...facets.filter(
          (facet, index) => index >= limit && facet.value === selected,
        ),
      ];

  return (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-0.5">
        {visible.map((facet) => {
          const active = selected === facet.value;
          return (
            <li key={facet.value}>
              <button
                type="button"
                onClick={() => onToggle(facet.value)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start text-sm transition-colors",
                  active
                    ? "bg-accent/12 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn("truncate", mono && "font-mono")}
                  dir={mono ? "ltr" : undefined}
                >
                  {facet.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    active ? "text-accent" : "opacity-55",
                  )}
                >
                  {toPersianDigits(facet.count)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {facets.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 px-2 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {expanded
            ? "نمایش کمتر"
            : `${toPersianDigits(facets.length - limit)} مورد دیگر`}
        </button>
      ) : null}
    </div>
  );
}

export function ArticleBrowser({
  articles,
  tags,
  authors,
  issues,
}: ArticleBrowserProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [author, setAuthor] = useState<string | null>(null);
  const [issue, setIssue] = useState<string | null>(null);

  const searchIndex = useMemo<SearchDoc[]>(
    () =>
      articles.map((article) => ({
        url: article.url,
        title: article.title,
        description: article.description,
        tags: article.tags,
        authors: article.authors.map((a) => a.name),
        kind: "article" as const,
        issue: article.issueNumber,
      })),
    [articles],
  );

  const results = useMemo(() => {
    let list = articles;

    if (tag) list = list.filter((a) => a.tags.includes(tag));
    if (author) list = list.filter((a) => a.authors.some((x) => x.id === author));
    if (issue) list = list.filter((a) => a.issueNumber === issue);

    if (query.trim()) {
      const matches = new Set(
        searchDocs(searchIndex, query, articles.length).map((d) => d.url),
      );
      list = list.filter((a) => matches.has(a.url));
    }

    return list;
  }, [articles, searchIndex, query, tag, author, issue]);

  const activeFilters = [
    tag && { label: tag, clear: () => setTag(null) },
    author && {
      label: authors.find((a) => a.value === author)?.label ?? author,
      clear: () => setAuthor(null),
    },
    issue && { label: issue, clear: () => setIssue(null) },
  ].filter(Boolean) as Array<{ label: string; clear: () => void }>;

  const hasFilters = activeFilters.length > 0 || Boolean(query.trim());

  const clearAll = () => {
    setQuery("");
    setTag(null);
    setAuthor(null);
    setIssue(null);
  };

  const toggle =
    (setter: (value: string | null) => void, current: string | null) =>
    (value: string) =>
      setter(current === value ? null : value);

  return (
    <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10">
      {/* Filters live in a quiet rail so the articles stay the subject of the
          page, rather than sitting under a large panel. */}
      <aside className="mb-8 lg:mb-0">
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pb-6 scroll-subtle">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جست‌وجو…"
              aria-label="جست‌وجو در مقاله‌ها"
              className="pe-9"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
            <FacetGroup
              title="شماره"
              facets={issues}
              selected={issue}
              onToggle={toggle(setIssue, issue)}
              mono
              limit={8}
            />
            <FacetGroup
              title="برچسب"
              facets={tags}
              selected={tag}
              onToggle={toggle(setTag, tag)}
            />
            <FacetGroup
              title="نویسنده"
              facets={authors}
              selected={author}
              onToggle={toggle(setAuthor, author)}
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b pb-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {toPersianDigits(results.length)} مطلب
          </p>

          {activeFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={filter.clear}
              className="flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-accent/20"
            >
              {filter.label}
              <X className="size-3" />
            </button>
          ))}

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="ms-auto h-7 text-xs"
            >
              پاک کردن همه
            </Button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              مطلبی با این فیلترها پیدا نشد.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="mt-4"
            >
              پاک کردن فیلترها
            </Button>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((article) => (
              <li key={article.url}>
                <ArticleSummary article={article} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
