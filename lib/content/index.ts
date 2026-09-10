import { getGraph, tagSlug } from "./graph";
import type {
  Article,
  Author,
  BlogPost,
  CodenamehEntry,
  Issue,
  StaffSection,
  Tag,
  Workshop,
  WorkshopDoc,
} from "./schema";

export { getGraph, tagSlug };
export * from "./schema";

export function getAllArticles(): Article[] {
  return getGraph().articles;
}

export function getArticle(issue: string, slug: string): Article | undefined {
  return getGraph().articlesByKey.get(`${issue}/${slug}`);
}

export function getAllIssues(): Issue[] {
  return getGraph().issues;
}

export function getIssue(number: string): Issue | undefined {
  return getGraph().issuesByNumber.get(number);
}

export function getLatestIssue(): Issue | undefined {
  return getGraph().issues[0];
}

export function getAllAuthors(): Author[] {
  return getGraph().authors;
}

export function getAuthor(id: string): Author | undefined {
  return getGraph().authorsById.get(id);
}

export function getAllTags(): Tag[] {
  return getGraph().tags;
}

export function getTag(slug: string): Tag | undefined {
  return getGraph().tagsBySlug.get(slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return getGraph().blogPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getGraph().blogPostsBySlug.get(slug);
}

export function getAllWorkshops(): Workshop[] {
  return getGraph().workshops;
}

export function getWorkshop(slug: string): Workshop | undefined {
  return getGraph().workshopsBySlug.get(slug);
}

export function getWorkshopDoc(
  workshop: string,
  slug: string,
): WorkshopDoc | undefined {
  return getGraph()
    .workshopsBySlug.get(workshop)
    ?.docs.find((doc) => doc.slug === slug);
}

export function getStaffSections(): StaffSection[] {
  return getGraph().staff;
}

export function getCodenameh(): CodenamehEntry[] {
  return getGraph().codenameh;
}

/**
 * Articles sharing the most tags with the given one, excluding itself.
 * Ties break toward articles in the same issue, then by recency.
 */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const tags = new Set(article.tags);
  if (tags.size === 0) return [];

  return getGraph()
    .articles.filter((candidate) => candidate.url !== article.url)
    .map((candidate) => ({
      candidate,
      shared: candidate.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        Number(b.candidate.issueNumber === article.issueNumber) -
          Number(a.candidate.issueNumber === article.issueNumber) ||
        b.candidate.date.localeCompare(a.candidate.date),
    )
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Previous and next articles within the same issue, in reading order. */
export function getAdjacentArticles(article: Article): {
  prev?: Article;
  next?: Article;
} {
  const siblings = article.issue.articles;
  const index = siblings.findIndex((item) => item.url === article.url);
  if (index === -1) return {};
  return {
    prev: index > 0 ? siblings[index - 1] : undefined,
    next: index < siblings.length - 1 ? siblings[index + 1] : undefined,
  };
}

export interface SiteStats {
  articles: number;
  authors: number;
  issues: number;
  codenameh: number;
  workshops: number;
  blogPosts: number;
  tags: number;
}

/** Site-wide counts, computed once at build time. */
export function getStats(): SiteStats {
  const graph = getGraph();
  return {
    articles: graph.articles.length,
    authors: graph.authors.length,
    issues: graph.issues.length,
    codenameh: graph.codenameh.length,
    workshops: graph.workshops.length,
    blogPosts: graph.blogPosts.length,
    tags: graph.tags.length,
  };
}
