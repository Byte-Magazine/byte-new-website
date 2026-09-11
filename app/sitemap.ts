import type { MetadataRoute } from "next";

import {
  getAllArticles,
  getAllAuthors,
  getAllBlogPosts,
  getAllIssues,
  getAllTags,
  getAllWorkshops,
} from "@/lib/content";
import { SITE } from "@/lib/site";

// Required for output: "export" — the route is generated once at build time.
export const dynamic = "force-static";

/** Enumerates every route from the content graph. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE.url}${path}`;
  const today = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      priority: 1,
      changeFrequency: "weekly",
      lastModified: today,
    },
    {
      url: url("/articles"),
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: today,
    },
    {
      url: url("/mags/intro"),
      priority: 0.9,
      changeFrequency: "monthly",
      lastModified: today,
    },
    {
      url: url("/blog"),
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: today,
    },
    {
      url: url("/workshops"),
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: today,
    },
    {
      url: url("/codenameh"),
      priority: 0.6,
      changeFrequency: "yearly",
      lastModified: today,
    },
    {
      url: url("/staff"),
      priority: 0.6,
      changeFrequency: "monthly",
      lastModified: today,
    },
    {
      url: url("/authors"),
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: today,
    },
  ];

  const articles: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: url(article.url),
    lastModified: new Date(article.date),
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const issues: MetadataRoute.Sitemap = getAllIssues().map((issue) => ({
    url: url(issue.url),
    lastModified: new Date(issue.date),
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  const posts: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: url(post.url),
    lastModified: new Date(post.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const workshopDocs: MetadataRoute.Sitemap = getAllWorkshops().flatMap(
    (workshop) =>
      workshop.docs.map((doc) => ({
        url: url(doc.url),
        lastModified: today,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
  );

  const authors: MetadataRoute.Sitemap = getAllAuthors().map((author) => ({
    url: url(author.url),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const tags: MetadataRoute.Sitemap = getAllTags().map((tag) => ({
    url: url(tag.url),
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...issues,
    ...articles,
    ...posts,
    ...workshopDocs,
    ...authors,
    ...tags,
  ];
}
