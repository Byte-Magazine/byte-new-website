import { normalizePersian } from "../../lib/persian";

/**
 * Removes the Docusaurus-specific import lines (`@site/...` and `@theme/...`).
 * The new site provides these components globally, so content needs no imports.
 */
export function stripSiteImports(body: string): string {
  return body
    .replace(/^import\s+.*?from\s+["']@(?:site|theme|docusaurus)\/[^"']*["'];?[ \t]*$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Rewrites Docusaurus's `<Admonition type="info">` element to `<Callout>`,
 * dropping its `icon` prop which the new Callout derives from the type.
 */
export function convertAdmonitionElements(body: string): string {
  return body
    .replace(/<Admonition\b([^>]*)>/g, (_match, attrs: string) => {
      const type = attrs.match(/type=["'](\w+)["']/)?.[1] ?? "note";
      const title = attrs.match(/title=["']([^"']*)["']/)?.[1] ?? "";
      const mapped = type === "caution" ? "warning" : type;
      return title
        ? `<Callout type="${mapped}" title="${title}">`
        : `<Callout type="${mapped}">`;
    })
    .replace(/<\/Admonition>/g, "</Callout>");
}

const ADMONITION_TYPES = [
  "danger",
  "info",
  "note",
  "tip",
  "warning",
  "caution",
] as const;

interface Line {
  text: string;
  inFence: boolean;
}

/** Tags each line with whether it sits inside a fenced code block. */
function markFences(body: string): Line[] {
  const lines = body.split("\n");
  const result: Line[] = [];
  let fenceChar = "";

  for (const text of lines) {
    const match = text.match(/^\s*(`{3,}|~{3,})/);
    if (match) {
      const char = match[1][0];
      if (!fenceChar) {
        fenceChar = char;
        result.push({ text, inFence: true });
        continue;
      }
      if (char === fenceChar) {
        fenceChar = "";
        result.push({ text, inFence: true });
        continue;
      }
    }
    result.push({ text, inFence: Boolean(fenceChar) });
  }

  return result;
}

/**
 * Converts Docusaurus `:::type` admonitions into `<Callout>` elements.
 *
 * Runs in two passes: the first pairs opening and closing markers so an
 * unbalanced marker can be left untouched rather than producing a stray
 * `</Callout>`. Fenced code is skipped so `:::` inside a code sample survives.
 */
export function convertAdmonitions(body: string): string {
  const lines = markFences(body);

  // Pass 1: pair up markers.
  const openStack: number[] = [];
  const openToClose = new Map<number, number>();

  lines.forEach((line, index) => {
    if (line.inFence) return;
    const open = line.text.match(/^:::(\w+)[ \t]*(.*)$/);
    if (open && (ADMONITION_TYPES as readonly string[]).includes(open[1])) {
      openStack.push(index);
      return;
    }
    if (/^:::[ \t]*$/.test(line.text) && openStack.length > 0) {
      openToClose.set(openStack.pop()!, index);
    }
  });

  const closeLines = new Set(openToClose.values());

  // Pass 2: rewrite only the markers that were successfully paired.
  const out = lines.map((line, index) => {
    if (openToClose.has(index)) {
      const open = line.text.match(/^:::(\w+)[ \t]*(.*)$/)!;
      const type = open[1] === "caution" ? "warning" : open[1];
      const title = open[2].trim();
      return title
        ? `<Callout type="${type}" title="${title.replace(/"/g, "&quot;")}">`
        : `<Callout type="${type}">`;
    }
    if (closeLines.has(index)) return "</Callout>";
    return line.text;
  });

  return out.join("\n");
}

/** Collapses whitespace in a tag while preserving its display casing. */
export function normalizeTag(tag: string): string {
  return tag.replace(/\s+/g, " ").trim();
}

/**
 * Groups tags whose normalized forms collide (ی/ي, ک/ك, casing, ZWNJ) and
 * elects the most frequent surface form as canonical. Ties break
 * alphabetically so the result is deterministic across runs.
 */
export function buildTagMap(tags: string[]): Map<string, string> {
  const groups = new Map<string, Map<string, number>>();

  for (const raw of tags) {
    const display = normalizeTag(raw);
    if (!display) continue;
    const key = normalizePersian(display);
    if (!groups.has(key)) groups.set(key, new Map());
    const counts = groups.get(key)!;
    counts.set(display, (counts.get(display) ?? 0) + 1);
  }

  const map = new Map<string, string>();
  for (const counts of groups.values()) {
    const canonical = [...counts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0][0];
    for (const form of counts.keys()) map.set(form, canonical);
  }
  return map;
}

/** Splits a `NN-slug` directory name into its sort order and slug. */
export function parseOrderFromDirname(dirname: string): {
  order: number;
  slug: string;
} {
  const match = dirname.match(/^(\d+)-(.+)$/);
  if (!match) return { order: 0, slug: dirname };
  return { order: Number(match[1]), slug: match[2] };
}

/** Normalizes co-located image references to an explicit `./img/` prefix. */
export function rewriteImagePaths(body: string): string {
  return body
    .replace(/!\[([^\]]*)\]\((?!\.\/|\/|https?:)img\//g, "![$1](./img/")
    .replace(/(src=["'])(?!\.\/|\/|https?:)img\//g, "$1./img/");
}

/**
 * Finds capitalized JSX tags not present in the known-component set, so the
 * migration report can flag anything the new site would fail to render.
 */
export function findUnknownJsxTags(
  body: string,
  known: Set<string>,
): string[] {
  // Components the file defines itself are valid MDX and need no provider.
  const local = new Set<string>();
  for (const match of body.matchAll(
    /(?:export\s+)?(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]*)/g,
  )) {
    local.add(match[1]);
  }

  const found = new Set<string>();
  for (const line of markFences(body)) {
    if (line.inFence) continue;
    for (const match of line.text.matchAll(/<([A-Z][A-Za-z0-9_]*)/g)) {
      if (!known.has(match[1]) && !local.has(match[1])) found.add(match[1]);
    }
  }
  return [...found].sort();
}
