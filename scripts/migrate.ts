/**
 * One-time migration from the legacy Docusaurus site into `content/`.
 *
 * Idempotent: it clears and rewrites `content/`, so it can be re-run at any
 * time and produces an identical result. It never modifies the legacy repo.
 * After migration, `content/` is the source of truth and the build never
 * reads the legacy site again.
 *
 * Usage: pnpm migrate   (override the source with BYTE_LEGACY_PATH)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

import {
  buildTagMap,
  convertAdmonitions,
  convertAdmonitionElements,
  findUnknownJsxTags,
  normalizeTag,
  parseOrderFromDirname,
  rewriteImagePaths,
  stripSiteImports,
} from "./lib/transform";
import { mergeAuthors, type LegacyPerson, type LegacyStaffSection } from "./lib/people";
import { parseJalaliDate } from "./lib/jalali";
import { parseArrayLiteral } from "./lib/literal";
import {
  articleFrontmatterSchema,
  blogFrontmatterSchema,
  codenamehSchema,
  issueMetaSchema,
  workshopFrontmatterSchema,
  type CodenamehEntry,
} from "../lib/content/schema";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const LEGACY = resolve(ROOT, process.env.BYTE_LEGACY_PATH ?? "../byte-site");
const CONTENT = join(ROOT, "content");
const PUBLIC = join(ROOT, "public");

/** Components the new site provides globally to MDX. */
const KNOWN_COMPONENTS = new Set([
  "Tooltip",
  "Callout",
  "AuthorCallout",
  "Timeline",
  "TimelineItem",
  "Mermaid",
  "DocItemAuthors",
  "Figure",
]);

const report: string[] = [];
const warnings: string[] = [];
const unknownTags = new Map<string, string[]>();

function log(message: string) {
  console.log(message);
  report.push(message);
}

function warn(message: string) {
  warnings.push(message);
}

/** Reads a named array literal from a legacy TS data module. */
function readArrayLiteral<T>(file: string, marker: string): T[] {
  return parseArrayLiteral<T>(readFileSync(file, "utf8"), marker);
}

/** Reads the legacy staff list, which is a typed TS module. */
function readStaffSections(): LegacyStaffSection[] {
  return readArrayLiteral<LegacyStaffSection>(
    join(LEGACY, "src/data/STAFF_SECTION_LIST.ts"),
    "const STAFF_SECTION_LIST: StaffSection[] =",
  );
}

function readYamlAuthors(file: string): Record<string, LegacyPerson> {
  // The legacy authors.yml is a flat two-level map; parsing it directly avoids
  // adding a YAML dependency for a single file.
  const out: Record<string, LegacyPerson> = {};
  let current: LegacyPerson | null = null;
  let inSocials = false;

  for (const raw of readFileSync(file, "utf8").split("\n")) {
    if (!raw.trim() || raw.trim().startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();

    if (indent === 0) {
      const id = line.replace(/:$/, "");
      current = { name: "", socials: {} };
      out[id] = current;
      inSocials = false;
      continue;
    }
    if (!current) continue;

    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();

    if (indent === 2) {
      inSocials = key === "socials";
      if (inSocials) {
        if (value && value !== "{}") current.socials = {};
        continue;
      }
      if (key === "name") current.name = value;
      else if (key === "title") current.title = value;
      else if (key === "image_url") current.image_url = value;
      else if (key === "url") current.url = value;
    } else if (indent >= 4 && inSocials && value) {
      current.socials![key] = value;
    }
  }
  return out;
}

function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith(".") && statSync(join(dir, name)).isDirectory())
    .sort();
}

function findMarkdown(dir: string): string[] {
  const out: string[] = [];
  const walk = (current: string) => {
    for (const name of readdirSync(current)) {
      if (name.startsWith(".")) continue;
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith(".md") || name.endsWith(".mdx")) out.push(path);
    }
  };
  if (existsSync(dir)) walk(dir);
  return out;
}

/** Applies the shared body transforms and records any unknown components. */
function transformBody(body: string, sourceLabel: string): string {
  let out = stripSiteImports(body);
  out = convertAdmonitions(out);
  out = convertAdmonitionElements(out);
  out = rewriteImagePaths(out);

  const unknown = findUnknownJsxTags(out, KNOWN_COMPONENTS);
  if (unknown.length > 0) unknownTags.set(sourceLabel, unknown);

  return out.trim() + "\n";
}

function writeMdx(
  target: string,
  frontmatter: Record<string, unknown>,
  body: string,
) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, matter.stringify(body, frontmatter), "utf8");
}

/** Copies a co-located img/ directory next to a migrated article. */
function copyImages(sourceDir: string, targetDir: string): number {
  const imgDir = join(sourceDir, "img");
  if (!existsSync(imgDir)) return 0;
  cpSync(imgDir, join(targetDir, "img"), { recursive: true });
  return readdirSync(imgDir).filter((f) => !f.startsWith(".")).length;
}

function main() {
  if (!existsSync(LEGACY)) {
    throw new Error(`legacy site not found at ${LEGACY}; set BYTE_LEGACY_PATH`);
  }

  log(`# Migration report\n`);
  log(`Source: \`${relative(ROOT, LEGACY) || LEGACY}\``);
  log(`Generated: ${new Date().toISOString().slice(0, 10)}\n`);

  rmSync(CONTENT, { recursive: true, force: true });
  mkdirSync(CONTENT, { recursive: true });

  // ---- Issues -------------------------------------------------------------
  const featureList = readArrayLiteral<{
    file: string;
    slug: string;
    title: string;
    date: string;
    imageSrc: string;
    description: string;
    themeColor: string;
  }>(join(LEGACY, "src/data/FEATURE_LIST.ts"), "export const featureList");

  const issueDates = new Map<string, string>();
  for (const issue of featureList) {
    const date = parseJalaliDate(issue.date);
    issueDates.set(issue.file, date);
    const meta = issueMetaSchema.parse({
      number: issue.file,
      title: issue.title,
      description: issue.description.trim(),
      date,
      cover: issue.imageSrc,
      themeColor: issue.themeColor,
    });
    const dir = join(CONTENT, "issues", issue.file);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
  }
  log(`- Issues: ${featureList.length}`);

  // ---- Collect tags first so the canonical map covers the whole corpus ----
  const magFiles = findMarkdown(join(LEGACY, "mags"));
  const blogFiles = findMarkdown(join(LEGACY, "blog"));
  const allTags: string[] = [];
  for (const file of [...magFiles, ...blogFiles]) {
    const { data } = matter(readFileSync(file, "utf8"));
    for (const tag of (data.tags as string[] | undefined) ?? []) {
      allTags.push(String(tag));
    }
  }
  const tagMap = buildTagMap(allTags);
  const canonical = (tag: string) =>
    tagMap.get(normalizeTag(String(tag))) ?? normalizeTag(String(tag));

  // ---- Mag articles -------------------------------------------------------
  let articleCount = 0;
  let imageCount = 0;
  const missingAuthors = new Set<string>();
  const knownAuthorIds = new Set<string>();

  const magsAuthors = JSON.parse(
    readFileSync(join(LEGACY, "mags/authors.json"), "utf8"),
  ) as Record<string, LegacyPerson>;
  const blogAuthors = readYamlAuthors(join(LEGACY, "blog/authors.yml"));
  for (const id of Object.keys(magsAuthors)) knownAuthorIds.add(id);
  for (const id of Object.keys(blogAuthors)) knownAuthorIds.add(id);

  for (const file of magFiles) {
    const rel = relative(join(LEGACY, "mags"), file);
    const parts = rel.split("/");

    // Skip the archive intro page; it is rebuilt as a real route.
    if (parts.length === 1) continue;

    const issueNumber = parts[0];
    if (!/^[01]{8}$/.test(issueNumber)) continue;

    const articleDir = dirname(file);
    const dirName = basename(articleDir);
    const { order, slug } =
      basename(file) === "index.mdx" || basename(file) === "index.md"
        ? parseOrderFromDirname(dirName)
        : parseOrderFromDirname(basename(file).replace(/\.mdx?$/, ""));

    const parsed = matter(readFileSync(file, "utf8"));
    const authors = ((parsed.data.authors as string[] | undefined) ?? []).map(String);
    for (const id of authors) {
      if (!knownAuthorIds.has(id)) missingAuthors.add(`${id} (${rel})`);
    }

    const targetDir = join(CONTENT, "issues", issueNumber, slug);
    const copied = copyImages(articleDir, targetDir);
    imageCount += copied;

    // Prefer an explicit cover, else the first co-located image.
    let cover: string | undefined;
    if (copied > 0) {
      const first = readdirSync(join(targetDir, "img"))
        .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
        .sort()[0];
      if (first) cover = `./img/${first}`;
    }

    const frontmatter = articleFrontmatterSchema.parse({
      title: String(parsed.data.title ?? slug),
      description: String(parsed.data.description ?? "").trim(),
      authors,
      tags: ((parsed.data.tags as string[] | undefined) ?? []).map(canonical),
      date: issueDates.get(issueNumber)!,
      issue: issueNumber,
      order,
      ...(cover ? { cover } : {}),
    });

    writeMdx(
      join(targetDir, "index.mdx"),
      frontmatter,
      transformBody(parsed.content, `mags/${rel}`),
    );
    articleCount++;
  }
  log(`- Articles: ${articleCount}`);
  log(`- Article images copied: ${imageCount}`);

  // ---- Blog ---------------------------------------------------------------
  let blogCount = 0;
  for (const file of blogFiles) {
    const rel = relative(join(LEGACY, "blog"), file);
    const parts = rel.split("/");
    if (parts.length < 2) continue;

    const year = parts[0];
    const dirName = parts.length > 2 ? parts[1] : basename(file).replace(/\.mdx?$/, "");
    const dateMatch = dirName.match(/^(\d{2})-(\d{2})-(.+)$/);
    if (!dateMatch || !/^\d{4}$/.test(year)) {
      warn(`blog post with unrecognized path skipped: ${rel}`);
      continue;
    }
    const [, month, day, slug] = dateMatch;
    const parsed = matter(readFileSync(file, "utf8"));
    const authors = ((parsed.data.authors as string[] | undefined) ?? []).map(String);
    for (const id of authors) {
      if (!knownAuthorIds.has(id)) missingAuthors.add(`${id} (blog/${rel})`);
    }

    const targetDir = join(CONTENT, "blog", slug);
    imageCount += copyImages(dirname(file), targetDir);

    const frontmatter = blogFrontmatterSchema.parse({
      title: String(parsed.data.title ?? slug),
      description: String(parsed.data.description ?? "").trim(),
      authors,
      tags: ((parsed.data.tags as string[] | undefined) ?? []).map(canonical),
      date: `${year}-${month}-${day}`,
      ...(parsed.data.image ? { cover: String(parsed.data.image) } : {}),
    });

    writeMdx(
      join(targetDir, "index.mdx"),
      frontmatter,
      transformBody(parsed.content, `blog/${rel}`),
    );
    blogCount++;
  }
  log(`- Blog posts: ${blogCount}`);

  // ---- Workshops ----------------------------------------------------------
  let workshopDocs = 0;
  const workshops: Array<{ slug: string; title: string; description: string }> = [];
  for (const workshopSlug of listDirs(join(LEGACY, "workshops"))) {
    const workshopDir = join(LEGACY, "workshops", workshopSlug);
    const categoryFile = join(workshopDir, "_category_.json");
    let title = workshopSlug;
    if (existsSync(categoryFile)) {
      const category = JSON.parse(readFileSync(categoryFile, "utf8"));
      title = category.label ?? workshopSlug;
    }
    workshops.push({ slug: workshopSlug, title, description: "" });

    for (const file of findMarkdown(workshopDir)) {
      const docDir = dirname(file);
      const isIndex = /^index\.mdx?$/.test(basename(file));
      const dirName = isIndex ? basename(docDir) : basename(file).replace(/\.mdx?$/, "");
      const { order, slug } = parseOrderFromDirname(dirName);
      const parsed = matter(readFileSync(file, "utf8"));

      const targetDir = join(CONTENT, "workshops", workshopSlug, slug);
      imageCount += copyImages(docDir, targetDir);

      const frontmatter = workshopFrontmatterSchema.parse({
        title: String(parsed.data.title ?? slug),
        description: String(parsed.data.description ?? "").trim(),
        authors: ((parsed.data.authors as string[] | undefined) ?? []).map(String),
        order,
        workshop: workshopSlug,
      });

      writeMdx(
        join(targetDir, "index.mdx"),
        frontmatter,
        transformBody(parsed.content, `workshops/${workshopSlug}/${slug}`),
      );
      workshopDocs++;
    }
  }
  writeFileSync(
    join(CONTENT, "workshops", "workshops.json"),
    JSON.stringify(workshops, null, 2) + "\n",
  );
  log(`- Workshops: ${workshops.length} (${workshopDocs} docs)`);

  // ---- People -------------------------------------------------------------
  const staffSections = readStaffSections();
  const { authors, staff, warnings: peopleWarnings } = mergeAuthors(
    magsAuthors,
    blogAuthors,
    staffSections,
  );
  for (const w of peopleWarnings) warn(w);

  mkdirSync(join(CONTENT, "people"), { recursive: true });
  writeFileSync(
    join(CONTENT, "people", "authors.json"),
    JSON.stringify(authors, null, 2) + "\n",
  );
  writeFileSync(
    join(CONTENT, "people", "staff.json"),
    JSON.stringify(staff, null, 2) + "\n",
  );
  log(`- Authors: ${authors.length}`);
  log(`- Staff sections: ${staff.length}`);

  // ---- Codenameh ----------------------------------------------------------
  const codenamehList = readArrayLiteral<{
    name: string;
    features: Array<{
      file: string;
      title: string;
      imageSrc: string;
      description: string;
      themeColor: string;
    }>;
  }>(join(LEGACY, "src/data/FEATURE_LIST.ts"), "export const codenamehList");

  const codenameh: CodenamehEntry[] = [];
  for (const era of codenamehList) {
    for (const entry of era.features) {
      codenameh.push(
        codenamehSchema.parse({
          id: entry.file,
          number: Number(entry.file.replace(/\D/g, "")),
          title: entry.title,
          description: entry.description.trim(),
          cover: entry.imageSrc,
          themeColor: entry.themeColor,
          era: era.name,
        }),
      );
    }
  }
  codenameh.sort((a, b) => a.number - b.number);
  writeFileSync(
    join(CONTENT, "codenameh.json"),
    JSON.stringify(codenameh, null, 2) + "\n",
  );
  log(`- Codenameh: ${codenameh.length}`);

  // ---- Static assets ------------------------------------------------------
  mkdirSync(PUBLIC, { recursive: true });
  for (const dir of ["img", "fonts"]) {
    const source = join(LEGACY, "static", dir);
    if (existsSync(source)) {
      cpSync(source, join(PUBLIC, dir), { recursive: true });
    }
  }
  const robots = join(LEGACY, "static", "robots.txt");
  if (existsSync(robots)) log(`- Copied static/img and static/fonts`);

  // ---- Tag report ---------------------------------------------------------
  const merges = new Map<string, string[]>();
  for (const [variant, target] of tagMap) {
    if (variant === target) continue;
    if (!merges.has(target)) merges.set(target, []);
    merges.get(target)!.push(variant);
  }

  const uniqueTags = new Set(tagMap.values());
  log(`- Tags: ${uniqueTags.size} canonical (${merges.size} merged groups)\n`);

  // ---- Write the report ---------------------------------------------------
  const lines = [...report];

  lines.push(`## Tag merges\n`);
  if (merges.size === 0) {
    lines.push(`No tag variants needed merging.\n`);
  } else {
    lines.push(`| Canonical | Merged variants |`);
    lines.push(`| --- | --- |`);
    for (const [target, variants] of [...merges].sort()) {
      lines.push(`| \`${target}\` | ${variants.map((v) => `\`${v}\``).join(", ")} |`);
    }
    lines.push("");
  }

  lines.push(`## Unknown components\n`);
  if (unknownTags.size === 0) {
    lines.push(`None. Every JSX tag in the migrated content is provided by the new site.\n`);
  } else {
    for (const [file, tags] of unknownTags) {
      lines.push(`- \`${file}\`: ${tags.join(", ")}`);
    }
    lines.push("");
  }

  lines.push(`## Unresolved author ids\n`);
  if (missingAuthors.size === 0) {
    lines.push(`None. Every author referenced in frontmatter exists.\n`);
  } else {
    for (const id of [...missingAuthors].sort()) lines.push(`- ${id}`);
    lines.push("");
  }

  lines.push(`## Warnings\n`);
  if (warnings.length === 0) {
    lines.push(`None.\n`);
  } else {
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  writeFileSync(join(ROOT, "migration-report.md"), lines.join("\n"));
  console.log(`\nWrote migration-report.md`);
}

main();
