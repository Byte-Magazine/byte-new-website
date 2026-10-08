import type { MetadataRoute } from "next";

import {
  getAllArticles,
  getAllAuthors,
  getAllBlogPosts,
  getAllIssues,
  getAllTags,
  getAllWorkshops,
  isIndexableTag,
} from "@/lib/content";
import { pageUrl } from "@/lib/seo";

// Required for output: "export" — the route is generated once at build time.
export const dynamic = "force-static";

type Entry = MetadataRoute.Sitemap[number];

/** Newest ISO date (YYYY-MM-DD) in the list, or undefined when empty. */
function newest(dates: readonly string[]): string | undefined {
  return dates.reduce<string | undefined>(
    (max, date) => (max === undefined || date > max ? date : max),
    undefined,
  );
}

/**
 * Enumerates every route from the content graph.
 *
 * `lastModified` is only emitted when it is real: Google discards the field
 * for sites whose dates change on every build. Pages without a trustworthy
 * date omit it rather than claim "today". `changeFrequency` and `priority`
 * are ignored by Google and Bing, so they are not emitted.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const issues = getAllIssues();
  const posts = getAllBlogPosts();
  const authors = getAllAuthors();
  const tags = getAllTags();

  const lastArticle = newest(articles.map((article) => article.date));
  const lastIssue = newest(issues.map((issue) => issue.date));
  const lastPost = newest(posts.map((post) => post.date));
  const lastContent = newest(
    [lastArticle, lastIssue, lastPost].filter(
      (date): date is string => date !== undefined,
    ),
  );

  const entry = (path: string, lastModified?: string): Entry => ({
    url: pageUrl(path),
    ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
  });

  const staticRoutes: Entry[] = [
    entry("/", lastContent),
    entry("/articles", lastArticle),
    entry("/mags/intro", lastIssue),
    entry("/blog", lastPost),
    entry("/workshops"),
    entry("/codenameh"),
    entry("/staff"),
    entry("/authors"),
    entry("/tags"),
  ];

  return [
    ...staticRoutes,
    ...issues.map((issue) => entry(issue.url, issue.date)),
    ...articles.map((article) => entry(article.url, article.date)),
    ...posts.map((post) => entry(post.url, post.date)),
    ...getAllWorkshops().flatMap((workshop) => [
      entry(workshop.url),
      ...workshop.docs.map((doc) => entry(doc.url)),
    ]),
    // Author pages change whenever they publish, so track their newest piece.
    ...authors.map((author) =>
      entry(
        author.url,
        newest([
          ...author.articles.map((article) => article.date),
          ...author.blogPosts.map((post) => post.date),
        ]),
      ),
    ),
    ...tags
      .filter(isIndexableTag)
      .map((tag) =>
        entry(
          tag.url,
          newest([
            ...tag.articles.map((article) => article.date),
            ...tag.blogPosts.map((post) => post.date),
          ]),
        ),
      ),
  ];
}
