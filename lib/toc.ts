import { normalizePersian } from "./persian";

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Mirrors rehype-slug's GitHub-style id generation. */
export function slugifyHeading(text: string): string {
  return normalizePersian(text)
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/**
 * Extracts h2/h3 headings from raw MDX for the table of contents.
 * Fenced code is skipped so a `# comment` inside a sample is not a heading.
 */
export function extractHeadings(source: string): Heading[] {
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(`{3,}|~{3,})/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (!match) continue;

    const text = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/[*_`]/g, "")
      .trim();
    if (!text) continue;

    headings.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length as 2 | 3,
    });
  }

  return headings;
}
