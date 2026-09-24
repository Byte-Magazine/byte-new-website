import { AuthorId } from "@/content/data/authors";
import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be ISO format YYYY-MM-DD");

const issueNumber = z
  .string()
  .regex(/^[01]{8}$/, "issue number must be 8 binary digits");

export const socialsSchema = z
  .object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    telegram: z.string().optional(),
  })
  .default({});

export const authorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  socials: socialsSchema,
  role: z.enum(["professor"]).optional(),
});

export const staffMemberSchema = z.object({
  authorId: z.string().min(1),
});

export const staffSectionSchema = z.object({
  name: z.string().min(1),
  members: z.array(staffMemberSchema),
});

export const issueMetaSchema = z.object({
  number: issueNumber,
  title: z.string().min(1),
  description: z.string().default(""),
  date: isoDate,
  cover: z.string().min(1),
  themeColor: z.string().min(1),
});

export const articleFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  authors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  date: isoDate,
  issue: issueNumber,
  order: z.number().int().nonnegative().default(0),
  cover: z.string().optional(),
});

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  authors: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  date: isoDate,
  cover: z.string().optional(),
});

export const workshopFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  authors: z.array(z.string()).default([]),
  order: z.number().int().nonnegative().default(0),
  workshop: z.string().min(1),
});

export const workshopMetaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
});

export const codenamehSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().default(""),
  cover: z.string().min(1),
  themeColor: z.string().min(1),
  era: z.string().min(1),
});

export type Socials = z.infer<typeof socialsSchema>;
export type AuthorRecord = z.infer<typeof authorSchema>;
export type StaffMember = { authorId: AuthorId };
export type StaffSection = {
  name: string;
  members: {
    authorId: AuthorId;
  }[];
};
export type IssueMeta = z.infer<typeof issueMetaSchema>;
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type WorkshopFrontmatter = z.infer<typeof workshopFrontmatterSchema>;
export type WorkshopMeta = z.infer<typeof workshopMetaSchema>;
export type CodenamehEntry = z.infer<typeof codenamehSchema>;

/**
 * Resolved graph types. Relations are populated once at build time, so
 * `author.articles` and `issue.articles` are real arrays, not lookups.
 */
export interface Author extends AuthorRecord {
  url: string;
  articles: Article[];
  blogPosts: BlogPost[];
  articleCount: number;
  isStaff: boolean;
  staffSections: string[];
}

export interface Article {
  slug: string;
  url: string;
  issueNumber: string;
  order: number;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  body: string;
  readingTime: number;
  authors: Author[];
  issue: Issue;
}

export interface Issue extends IssueMeta {
  url: string;
  pdfUrl: string;
  articles: Article[];
  articleCount: number;
}

export interface BlogPost {
  slug: string;
  url: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  body: string;
  readingTime: number;
  authors: Author[];
}

export interface WorkshopDoc {
  slug: string;
  url: string;
  workshop: string;
  order: number;
  title: string;
  description: string;
  body: string;
  readingTime: number;
  authors: Author[];
}

export interface Workshop {
  slug: string;
  title: string;
  description: string;
  url: string;
  docs: WorkshopDoc[];
}

export interface Tag {
  name: string;
  slug: string;
  url: string;
  articles: Article[];
  blogPosts: BlogPost[];
  count: number;
}

export interface ContentGraph {
  articles: readonly Article[];
  articlesByKey: Map<string, Article>;
  issues: readonly Issue[];
  issuesByNumber: Map<string, Issue>;
  authors: readonly Author[];
  authorsById: Map<string, Author>;
  tags: readonly Tag[];
  tagsBySlug: Map<string, Tag>;
  blogPosts: readonly BlogPost[];
  blogPostsBySlug: Map<string, BlogPost>;
  workshops: readonly Workshop[];
  workshopsBySlug: Map<string, Workshop>;
  staff: readonly StaffSection[];
  codenameh: readonly CodenamehEntry[];
}
