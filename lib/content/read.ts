import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

import { AUTHORS } from "@/content/data/authors";
import { CODENAMEH } from "@/content/data/codenameh";
import { STAFF_SECTIONS } from "@/content/data/staff";
import { WORKSHOPS } from "@/content/data/workshops";

import {
  articleFrontmatterSchema,
  blogFrontmatterSchema,
  issueMetaSchema,
  workshopFrontmatterSchema,
  type ArticleFrontmatter,
  type AuthorRecord,
  type BlogFrontmatter,
  type CodenamehEntry,
  type IssueMeta,
  type StaffSection,
  type WorkshopFrontmatter,
  type WorkshopMeta,
} from "./schema";

export const CONTENT_DIR = join(process.cwd(), "content");

export interface RawDoc<T> {
  frontmatter: T;
  body: string;
  slug: string;
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(
      (name) =>
        !name.startsWith(".") && statSync(join(dir, name)).isDirectory(),
    )
    .sort();
}

/**
 * Parses one MDX file and validates its frontmatter, failing the build with a
 * message that names the file so a bad edit is trivial to locate.
 */
function readDoc<T>(
  file: string,
  parse: (data: unknown) => T,
): { frontmatter: T; body: string } {
  const parsed = matter(readFileSync(file, "utf8"));
  try {
    return { frontmatter: parse(parsed.data), body: parsed.content };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid frontmatter in ${file}:\n${detail}`);
  }
}

function readJson<T>(file: string, parse: (data: unknown) => T): T {
  try {
    return parse(JSON.parse(readFileSync(file, "utf8")));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`invalid JSON in ${file}:\n${detail}`);
  }
}

export function readIssueMetas(): IssueMeta[] {
  const dir = join(CONTENT_DIR, "issues");
  return listDirs(dir).map((number) =>
    readJson(join(dir, number, "meta.json"), (d) => issueMetaSchema.parse(d)),
  );
}

export function readArticles(): RawDoc<ArticleFrontmatter>[] {
  const root = join(CONTENT_DIR, "issues");
  const out: RawDoc<ArticleFrontmatter>[] = [];

  for (const issue of listDirs(root)) {
    for (const slug of listDirs(join(root, issue))) {
      const file = join(root, issue, slug, "index.mdx");
      if (!existsSync(file)) continue;
      const { frontmatter, body } = readDoc(file, (d) =>
        articleFrontmatterSchema.parse(d),
      );
      out.push({ frontmatter, body, slug });
    }
  }
  return out;
}

export function readBlogPosts(): RawDoc<BlogFrontmatter>[] {
  const root = join(CONTENT_DIR, "blog");
  const out: RawDoc<BlogFrontmatter>[] = [];

  for (const slug of listDirs(root)) {
    const file = join(root, slug, "index.mdx");
    if (!existsSync(file)) continue;
    const { frontmatter, body } = readDoc(file, (d) =>
      blogFrontmatterSchema.parse(d),
    );
    out.push({ frontmatter, body, slug });
  }
  return out;
}

export function readWorkshopMetas(): WorkshopMeta[] {
  return WORKSHOPS;
}

export function readWorkshopDocs(): RawDoc<WorkshopFrontmatter>[] {
  const root = join(CONTENT_DIR, "workshops");
  const out: RawDoc<WorkshopFrontmatter>[] = [];

  for (const workshop of listDirs(root)) {
    for (const slug of listDirs(join(root, workshop))) {
      const file = join(root, workshop, slug, "index.mdx");
      if (!existsSync(file)) continue;
      const { frontmatter, body } = readDoc(file, (d) =>
        workshopFrontmatterSchema.parse(d),
      );
      out.push({ frontmatter, body, slug });
    }
  }
  return out;
}

export function readAuthorRecords(): readonly AuthorRecord[] {
  return AUTHORS;
}

export function readStaffSections(): readonly StaffSection[] {
  return STAFF_SECTIONS;
}

export function readCodenameh(): readonly CodenamehEntry[] {
  return CODENAMEH;
}
