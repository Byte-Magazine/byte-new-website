"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArticleSummary,
  type ArticleSummaryData,
} from "@/components/cards/article-summary";
import { searchDocs, type SearchDoc } from "@/lib/search";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

/**
 * Serialisable article shape; bodies are never sent to the client.
 * Extends the card's data with the fields only filtering needs.
 */
export interface BrowserArticle extends ArticleSummaryData {
  date: string;
  authors: Array<{ id: string; name: string }>;
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

function FacetGroup({
  title,
  facets,
  selected,
  onToggle,
  mono,
  limit = 12,
}: {
  title: string;
  facets: Facet[];
  selected: string | null;
  onToggle: (value: string) => void;
  mono?: boolean;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? facets : facets.slice(0, limit);
  if (facets.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-bold">{title}</p>
      <ul className="flex flex-wrap gap-1.5">
        {visible.map((facet) => (
          <li key={facet.value}>
            <button
              type="button"
              onClick={() => onToggle(facet.value)}
              aria-pressed={selected === facet.value}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                selected === facet.value
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <span className={mono ? "font-mono" : undefined} dir={mono ? "ltr" : undefined}>
                {facet.label}
              </span>
              <span className="opacity-60">{toPersianDigits(facet.count)}</span>
            </button>
          </li>
        ))}
      </ul>
      {facets.length > limit ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
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

  const hasFilters = Boolean(query.trim() || tag || author || issue);

  const toggle =
    (setter: (value: string | null) => void, current: string | null) =>
    (value: string) =>
      setter(current === value ? null : value);

  return (
    <div>
      <div className="mb-8 space-y-6 rounded-xl border bg-muted/30 p-5">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="جست‌وجو در عنوان، توضیح، برچسب و نویسنده…"
          aria-label="جست‌وجو در مقاله‌ها"
          className="bg-background"
        />

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

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setTag(null);
              setAuthor(null);
              setIssue(null);
            }}
          >
            <X className="size-3.5" />
            پاک کردن فیلترها
          </Button>
        ) : null}
      </div>

      <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
        {toPersianDigits(results.length)} مطلب
      </p>

      {results.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          مطلبی با این فیلترها پیدا نشد. فیلترها را تغییر دهید.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <li key={article.url}>
              <ArticleSummary article={article} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
