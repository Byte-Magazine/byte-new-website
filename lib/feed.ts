import { getAllArticles, getAllBlogPosts } from "./content";
import { metaDescription } from "./description";
import { pageUrl } from "./seo";
import { FEED_PATH, SITE } from "./site";

const FEED_LIMIT = 50;

export interface FeedItem {
  title: string;
  description: string;
  url: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  authors: string[];
  tags: string[];
}

const XML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);
}

/** RFC 822 date, as RSS 2.0 requires. Content dates carry no time of day. */
export function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

/** Newest articles and blog posts, merged. */
export function getFeedItems(limit = FEED_LIMIT): FeedItem[] {
  const items: FeedItem[] = [
    ...getAllArticles().map((article) => ({
      title: article.title,
      description: metaDescription(article.description, article.body),
      url: article.url,
      date: article.date,
      authors: article.authors.map((author) => author.name),
      tags: article.tags,
    })),
    ...getAllBlogPosts().map((post) => ({
      title: post.title,
      description: metaDescription(post.description, post.body),
      url: post.url,
      date: post.date,
      authors: post.authors.map((author) => author.name),
      tags: post.tags,
    })),
  ];

  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

function renderItem(item: FeedItem): string {
  const link = pageUrl(item.url);
  return [
    "    <item>",
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${link}</link>`,
    `      <guid isPermaLink="true">${link}</guid>`,
    `      <pubDate>${rfc822(item.date)}</pubDate>`,
    ...(item.description
      ? [`      <description>${escapeXml(item.description)}</description>`]
      : []),
    ...item.authors.map(
      (name) => `      <dc:creator>${escapeXml(name)}</dc:creator>`,
    ),
    ...item.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
    "    </item>",
  ].join("\n");
}

/** RSS 2.0 document for the given items. */
export function renderFeed(items: readonly FeedItem[]): string {
  const lastBuild = items[0]
    ? `\n    <lastBuildDate>${rfc822(items[0].date)}</lastBuildDate>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>fa-IR</language>${lastBuild}
    <atom:link href="${SITE.url}${FEED_PATH}" rel="self" type="application/rss+xml" />
${items.map(renderItem).join("\n")}
  </channel>
</rss>
`;
}
