import { toPersianDigits } from "./persian";

/**
 * Meta descriptions for search results.
 *
 * Many articles ship with no description, or a one-line teaser ("آیا
 * می‌دانید؟") too short to tell a searcher what the page covers. Search
 * engines then fall back to whatever text they pick, often the site
 * navigation. These helpers fill the gap from the article's own opening.
 */

/** Results pages show roughly this many characters before truncating. */
export const DESCRIPTION_MAX = 160;

/** Shorter than this, a hand-written description is topped up with an excerpt. */
export const DESCRIPTION_MIN = 70;

/** Blocks shorter than this are captions or labels, not prose. */
const MIN_PROSE_BLOCK = 40;

/** Strips markdown/MDX syntax from one block, leaving readable text. */
function cleanBlock(block: string): string {
  return (
    block
      // Images first, so their alt text is not kept by the link rule.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/<!--[\s\S]*?-->/g, " ")
      // JSX whitespace spacers: {" "}
      .replace(/\{\s*(["'])\s*\1\s*\}/g, " ")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      // JSX/HTML tags go, their text content stays.
      .replace(/<\/?[A-Za-z][^>]*>/g, " ")
      .replace(/\$[^$\n]+\$/g, " ")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/(\*\*|__|\*|_|~~)/g, "")
      .replace(/^\s*(>|[-*+]|\d+[.)])\s+/gm, "")
      // Decorative redaction bars ("█████") carry no meaning in a snippet.
      .replace(/[█▓▒░]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** Readable prose blocks of an MDX body, in document order. */
export function proseBlocks(body: string): string[] {
  const stripped = body
    .replace(/```[\s\S]*?```/g, "\n\n")
    .replace(/~~~[\s\S]*?~~~/g, "\n\n")
    .replace(/\$\$[\s\S]*?\$\$/g, "\n\n")
    // Inline <style>/<script> and template-literal expressions are code.
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, "\n\n")
    .replace(/\{`[\s\S]*?`\}/g, " ")
    // Headings nested (indented) inside JSX blocks are titles, not prose.
    .replace(/^[ \t]*#{1,6}[ \t].*$/gm, "")
    .replace(/<h[1-6]\b[\s\S]*?<\/h[1-6]>/gi, "\n\n")
    .replace(/^(import|export)\s.*$/gm, "");

  return stripped
    .split(/\n\s*\n/)
    .filter((block) => {
      const first = block.trim();
      // Headings, tables and admonition fences are structure, not prose.
      return first && !/^(#{1,6}\s|\||:::)/.test(first);
    })
    .map(cleanBlock)
    .filter((text) => text.length >= MIN_PROSE_BLOCK);
}

/** Cuts text to `max` characters at a word boundary, adding an ellipsis. */
export function truncate(text: string, max = DESCRIPTION_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const base = space > max / 2 ? cut.slice(0, space) : cut;
  return `${base.replace(/[\s،,؛;:.\-—]+$/, "")}…`;
}

/** The opening of an MDX body as plain text, at most `max` characters. */
export function excerpt(body: string, max = DESCRIPTION_MAX): string {
  let text = "";
  for (const block of proseBlocks(body)) {
    text = text ? `${text} ${block}` : block;
    if (text.length >= max) break;
  }
  return truncate(text, max);
}

/**
 * The description to put in `<meta name="description">`: the author's own
 * when it is long enough, otherwise topped up (or replaced) by the opening.
 */
export function metaDescription(description: string, body: string): string {
  const own = description.trim();
  if (own.length >= DESCRIPTION_MIN) return truncate(own);

  const opening = excerpt(body);
  if (!own) return opening;
  if (!opening) return own;
  // Teasers are often the body's first line; don't say it twice.
  if (opening.startsWith(own)) return opening;
  return truncate(`${own} — ${opening}`);
}

/** "«a»، «b» و «c»" — a Persian list of quoted titles. */
export function quotedList(titles: readonly string[]): string {
  const quoted = titles.map((title) => `«${title}»`);
  if (quoted.length <= 1) return quoted.join("");
  return `${quoted.slice(0, -1).join("، ")} و ${quoted.at(-1)}`;
}

interface Titled {
  title: string;
}

/**
 * `lead` followed by as many distinct titles as fit in the length budget, so
 * a list never ends on a half-cut title.
 */
function withTitles(lead: string, joiner: string, titles: string[]): string {
  const unique = [...new Set(titles)];
  let best = lead;
  for (let n = 1; n <= unique.length; n++) {
    const candidate = `${lead}${joiner}${quotedList(unique.slice(0, n))}`;
    if (candidate.length > DESCRIPTION_MAX) break;
    best = candidate;
  }
  return best;
}

/** An issue's description followed by the pieces it carries. */
export function issueDescription(issue: {
  number: string;
  description: string;
  articles: readonly Titled[];
}): string {
  const lead = `شمارهٔ ${issue.number} نشریه‌ی بایت${issue.description ? `، ${issue.description}` : ""}`;
  return withTitles(
    lead,
    "؛ با مطالبی چون ",
    issue.articles.map((article) => article.title),
  );
}

/** A tag's size and a sample of what sits under it. */
export function tagDescription(tag: {
  name: string;
  count: number;
  articles: readonly Titled[];
  blogPosts: readonly Titled[];
}): string {
  const lead = `${toPersianDigits(tag.count)} مطلب با برچسب «${tag.name}» در نشریه‌ی بایت`;
  return withTitles(
    lead,
    "، از جمله ",
    [...tag.articles, ...tag.blogPosts].map((item) => item.title),
  );
}

/** Who an author is and what they have written for Byte. */
export function authorDescription(author: {
  name: string;
  title?: string;
  articleCount: number;
  articles: readonly Titled[];
  blogPosts: readonly Titled[];
  staffSections: readonly string[];
}): string {
  const parts = [author.name, author.title].filter(Boolean).join(" — ");
  const roles: string[] = [];
  if (author.staffSections.length > 0) {
    // "مدیر مسئول و سردبیر" is itself the role; other sections are teams.
    roles.push(
      author.staffSections
        .map((section) =>
          section.startsWith("مدیر") ? section : `عضو تیم ${section}`,
        )
        .join(" و "),
    );
  }
  const pieces = author.articles.length + author.blogPosts.length;
  if (pieces > 0) {
    roles.push(`نویسندهٔ ${toPersianDigits(pieces)} مطلب`);
  }
  const lead = roles.length
    ? `${parts}؛ ${roles.join("، ")} در نشریه‌ی بایت`
    : parts;
  return withTitles(
    lead,
    ": ",
    [...author.articles, ...author.blogPosts].map((item) => item.title),
  );
}
