/**
 * Writes public/search-index.json from the content graph. Runs before build so
 * the client-side palette has a static file to fetch; nothing is indexed at
 * request time.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getAllArticles,
  getAllAuthors,
  getAllBlogPosts,
  getAllIssues,
  getAllWorkshops,
} from "../lib/content";
import type { SearchDoc } from "../lib/search";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

const docs: SearchDoc[] = [
  ...getAllArticles().map((article) => ({
    url: article.url,
    title: article.title,
    description: article.description,
    tags: article.tags,
    authors: article.authors.map((a) => a.name),
    kind: "article" as const,
    issue: article.issueNumber,
  })),
  ...getAllBlogPosts().map((post) => ({
    url: post.url,
    title: post.title,
    description: post.description,
    tags: post.tags,
    authors: post.authors.map((a) => a.name),
    kind: "blog" as const,
  })),
  ...getAllWorkshops().flatMap((workshop) =>
    workshop.docs.map((doc) => ({
      url: doc.url,
      title: doc.title,
      description: doc.description,
      tags: [workshop.title],
      authors: doc.authors.map((a) => a.name),
      kind: "workshop" as const,
    })),
  ),
  ...getAllAuthors().map((author) => ({
    url: author.url,
    title: author.name,
    description: author.title ?? "",
    tags: [],
    authors: [author.name],
    kind: "author" as const,
  })),
  ...getAllIssues().map((issue) => ({
    url: issue.url,
    title: `شمارهٔ ${issue.number}`,
    description: issue.description,
    tags: [],
    authors: [],
    kind: "issue" as const,
    issue: issue.number,
  })),
];

mkdirSync(join(ROOT, "public"), { recursive: true });
writeFileSync(
  join(ROOT, "public", "search-index.json"),
  JSON.stringify(docs),
  "utf8",
);

console.log(`Wrote search index with ${docs.length} documents`);
