import { normalizePersian, readingTimeMinutes } from "../persian";
import { pdfUrl } from "../site";
import {
  readArticles,
  readAuthorRecords,
  readBlogPosts,
  readCodenameh,
  readIssueMetas,
  readStaffSections,
  readWorkshopDocs,
  readWorkshopMetas,
} from "./read";
import type {
  Article,
  Author,
  BlogPost,
  ContentGraph,
  Issue,
  Tag,
  Workshop,
  WorkshopDoc,
} from "./schema";

/** URL-safe slug for a tag, folding Persian character variants. */
export function tagSlug(name: string): string {
  return encodeURIComponent(normalizePersian(name).replace(/\s+/g, "-"));
}

function buildGraph(): ContentGraph {
  // ---- Authors ------------------------------------------------------------
  const staffSections = readStaffSections();
  const staffByAuthorId = new Map<string, string[]>();
  for (const section of staffSections) {
    for (const member of section.members) {
      if (!member.authorId) continue;
      const sections = staffByAuthorId.get(member.authorId) ?? [];
      sections.push(section.name);
      staffByAuthorId.set(member.authorId, sections);
    }
  }

  const authorsById = new Map<string, Author>();
  for (const record of readAuthorRecords()) {
    const staffSectionNames = staffByAuthorId.get(record.id) ?? [];
    authorsById.set(record.id, {
      ...record,
      url: `/authors/${record.id}`,
      articles: [],
      blogPosts: [],
      articleCount: 0,
      isStaff: staffSectionNames.length > 0,
      staffSections: staffSectionNames,
    });
  }

  /** Resolves author ids, silently skipping ids with no record. */
  const resolveAuthors = (ids: string[]): Author[] =>
    ids
      .map((id) => authorsById.get(id))
      .filter((author): author is Author => Boolean(author));

  // ---- Issues -------------------------------------------------------------
  const issuesByNumber = new Map<string, Issue>();
  for (const meta of readIssueMetas()) {
    issuesByNumber.set(meta.number, {
      ...meta,
      url: `/mags/${meta.number}`,
      pdfUrl: pdfUrl(meta.number),
      articles: [],
      articleCount: 0,
    });
  }

  // ---- Articles -----------------------------------------------------------
  const articles: Article[] = [];
  const articlesByKey = new Map<string, Article>();

  for (const raw of readArticles()) {
    const issue = issuesByNumber.get(raw.frontmatter.issue);
    if (!issue) {
      throw new Error(
        `article "${raw.slug}" references unknown issue "${raw.frontmatter.issue}"`,
      );
    }

    const article: Article = {
      slug: raw.slug,
      url: `/mags/${issue.number}/${raw.slug}`,
      issueNumber: issue.number,
      order: raw.frontmatter.order,
      title: raw.frontmatter.title,
      description: raw.frontmatter.description,
      date: raw.frontmatter.date,
      tags: raw.frontmatter.tags,
      cover: raw.frontmatter.cover,
      body: raw.body,
      readingTime: readingTimeMinutes(raw.body),
      authors: resolveAuthors(raw.frontmatter.authors),
      issue,
    };

    articles.push(article);
    articlesByKey.set(`${issue.number}/${raw.slug}`, article);
    issue.articles.push(article);

    for (const author of article.authors) author.articles.push(article);
  }

  // Order articles within each issue, then newest issue first.
  for (const issue of issuesByNumber.values()) {
    issue.articles.sort((a, b) => a.order - b.order);
    issue.articleCount = issue.articles.length;
  }

  const issues = [...issuesByNumber.values()].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  articles.sort(
    (a, b) => b.date.localeCompare(a.date) || a.order - b.order,
  );

  // ---- Blog ---------------------------------------------------------------
  const blogPosts: BlogPost[] = [];
  const blogPostsBySlug = new Map<string, BlogPost>();

  for (const raw of readBlogPosts()) {
    const post: BlogPost = {
      slug: raw.slug,
      url: `/blog/${raw.slug}`,
      title: raw.frontmatter.title,
      description: raw.frontmatter.description,
      date: raw.frontmatter.date,
      tags: raw.frontmatter.tags,
      cover: raw.frontmatter.cover,
      body: raw.body,
      readingTime: readingTimeMinutes(raw.body),
      authors: resolveAuthors(raw.frontmatter.authors),
    };
    blogPosts.push(post);
    blogPostsBySlug.set(post.slug, post);
    for (const author of post.authors) author.blogPosts.push(post);
  }
  blogPosts.sort((a, b) => b.date.localeCompare(a.date));

  // ---- Workshops ----------------------------------------------------------
  const workshopsBySlug = new Map<string, Workshop>();
  for (const meta of readWorkshopMetas()) {
    workshopsBySlug.set(meta.slug, {
      slug: meta.slug,
      title: meta.title,
      description: meta.description,
      url: `/workshops/${meta.slug}`,
      docs: [],
    });
  }

  for (const raw of readWorkshopDocs()) {
    const workshop = workshopsBySlug.get(raw.frontmatter.workshop);
    if (!workshop) continue;
    const doc: WorkshopDoc = {
      slug: raw.slug,
      url: `/workshops/${workshop.slug}/${raw.slug}`,
      workshop: workshop.slug,
      order: raw.frontmatter.order,
      title: raw.frontmatter.title,
      description: raw.frontmatter.description,
      body: raw.body,
      readingTime: readingTimeMinutes(raw.body),
      authors: resolveAuthors(raw.frontmatter.authors),
    };
    workshop.docs.push(doc);
  }
  for (const workshop of workshopsBySlug.values()) {
    workshop.docs.sort((a, b) => a.order - b.order);
  }
  const workshops = [...workshopsBySlug.values()];

  // ---- Authors: finalize counts and ordering ------------------------------
  for (const author of authorsById.values()) {
    author.articles.sort((a, b) => b.date.localeCompare(a.date));
    author.blogPosts.sort((a, b) => b.date.localeCompare(a.date));
    author.articleCount = author.articles.length;
  }

  const authors = [...authorsById.values()].sort(
    (a, b) => b.articleCount - a.articleCount || a.name.localeCompare(b.name),
  );

  // ---- Tags ---------------------------------------------------------------
  const tagsBySlug = new Map<string, Tag>();
  const addTag = (name: string, target: "articles" | "blogPosts", item: Article | BlogPost) => {
    const slug = tagSlug(name);
    let tag = tagsBySlug.get(slug);
    if (!tag) {
      tag = {
        name,
        slug,
        url: `/tags/${slug}`,
        articles: [],
        blogPosts: [],
        count: 0,
      };
      tagsBySlug.set(slug, tag);
    }
    if (target === "articles") tag.articles.push(item as Article);
    else tag.blogPosts.push(item as BlogPost);
    tag.count++;
  };

  for (const article of articles) {
    for (const name of article.tags) addTag(name, "articles", article);
  }
  for (const post of blogPosts) {
    for (const name of post.tags) addTag(name, "blogPosts", post);
  }

  const tags = [...tagsBySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  return Object.freeze({
    articles,
    articlesByKey,
    issues,
    issuesByNumber,
    authors,
    authorsById,
    tags,
    tagsBySlug,
    blogPosts,
    blogPostsBySlug,
    workshops,
    workshopsBySlug,
    staff: staffSections,
    codenameh: readCodenameh(),
  });
}

let cached: ContentGraph | null = null;

/** Returns the resolved content graph, building it once per process. */
export function getGraph(): ContentGraph {
  if (!cached) cached = buildGraph();
  return cached;
}
