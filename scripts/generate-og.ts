/**
 * Renders an Open Graph image for every article, issue, blog post, and author.
 *
 * Static export cannot run dynamic `opengraph-image` routes, so the images are
 * produced at build time with Satori and written to public/og/.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

import {
  getAllArticles,
  getAllAuthors,
  getAllBlogPosts,
  getAllIssues,
} from "../lib/content";
import { formatJalali, toPersianDigits } from "../lib/persian";
import { SITE } from "../lib/site";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT_DIR = join(ROOT, "public", "og");

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: "#12151c",
  foreground: "#f2f4f8",
  muted: "#8b93a7",
  border: "#2b3040",
};

/**
 * Satori needs a static TTF; the app ships a variable WOFF2 whose `fvar` table
 * Satori's parser cannot read. The instanced weights are committed under
 * assets/fonts so the build needs no font tooling.
 */
function loadFont(weight: 400 | 700): Buffer {
  return readFileSync(join(ROOT, "assets", "fonts", `Pinar-${weight}.ttf`));
}

interface CardInput {
  title: string;
  subtitle?: string;
  meta?: string;
  accent: string;
  badge?: string;
}

/**
 * Builds the card as a Satori element tree.
 * Written as plain objects rather than JSX so this stays a standalone script.
 */
function card({ title, subtitle, meta, accent, badge }: CardInput) {
  const children: unknown[] = [];

  if (badge) {
    children.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          fontSize: 26,
          color: accent,
          letterSpacing: 4,
          marginBottom: 28,
        },
        children: badge,
      },
    });
  }

  const titleSize = title.length > 60 ? 52 : 62;
  children.push(
    rtlBlock(title, title.length > 60 ? 38 : 32, {
      fontSize: titleSize,
      fontWeight: 700,
      color: COLORS.foreground,
      lineHeight: 1.5,
    }),
  );

  if (subtitle) {
    const trimmed =
      subtitle.length > 130 ? `${subtitle.slice(0, 130)}…` : subtitle;
    children.push(
      rtlBlock(trimmed, 62, {
        fontSize: 30,
        color: COLORS.muted,
        lineHeight: 1.6,
        marginTop: 24,
      }),
    );
  }

  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: COLORS.background,
        padding: "68px 72px",
        fontFamily: "Pinar",
        direction: "rtl",
        borderTop: `10px solid ${accent}`,
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: 28,
            },
            children: [
              rtlBlock(SITE.name, 200, {
                fontSize: 28,
                color: COLORS.foreground,
              }),
              rtlBlock(meta ?? SITE.tagline, 200, {
                fontSize: 24,
                color: COLORS.muted,
              }),
            ],
          },
        },
      ],
    },
  };
}

interface Fonts {
  regular: Buffer;
  bold: Buffer;
}

async function render(input: CardInput, file: string, fonts: Fonts) {
  const svg = await satori(card(input) as never, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Pinar", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Pinar", data: fonts.bold, weight: 700, style: "normal" },
    ],
  });

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  })
    .render()
    .asPng();

  writeFileSync(join(OUT_DIR, file), png);
}

/**
 * Satori lays text out left-to-right and does not apply the bidi algorithm, so
 * Persian renders with its words in the wrong order — and its own line
 * wrapping would then scramble them further.
 *
 * Text is therefore wrapped here into fixed-width lines, each line reversed,
 * and rendered as separate rows. `maxChars` is approximate: Persian glyphs are
 * narrow enough that character count tracks width closely at these sizes.
 */
/**
 * Satori renders a run of Persian digits right-to-left, which flips the
 * number. Pre-reversing each digit run cancels that out.
 */
function fixDigitRuns(word: string): string {
  return word.replace(/[۰-۹٠-٩]{2,}/g, (run) => [...run].reverse().join(""));
}

export function rtlLines(text: string, maxChars: number): string[][] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[][] = [];
  let current: string[] = [];

  for (const word of words) {
    const candidate = [...current, word].join(" ");
    if (candidate.length > maxChars && current.length > 0) {
      lines.push([...current].reverse());
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length > 0) lines.push([...current].reverse());

  return lines.map((line) => line.map(fixDigitRuns));
}

/**
 * A stack of pre-wrapped, order-corrected RTL rows.
 *
 * Each word is its own flex child with an explicit gap: Satori collapses
 * whitespace inside a text node, which would run the reversed words together.
 */
function rtlBlock(
  text: string,
  maxChars: number,
  style: Record<string, unknown>,
) {
  const fontSize = Number(style.fontSize ?? 30);
  // Persian word-final glyphs extend visually; large display text needs a
  // proportionally wider space than body text to read as separate words.
  const space = Math.round(fontSize * 0.32);

  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", ...style },
      children: rtlLines(text, maxChars).map((line) => ({
        type: "div",
        props: {
          style: { display: "flex", flexDirection: "row" },
          children: line.map((word) => ({
            type: "div",
            props: {
              // A right margin on every word, including the last: the row is
              // start-aligned, so the trailing space is invisible.
              style: { display: "flex", marginRight: space },
              children: word,
            },
          })),
        },
      })),
    },
  };
}

/** rgba() from the legacy data is often too transparent for a solid accent. */
function solidAccent(themeColor: string): string {
  const match = themeColor.match(/rgba?\(([^)]+)\)/);
  if (!match) return "#6b8afd";
  const [r, g, b] = match[1].split(",").map((part) => Number(part.trim()));
  const hex = (value: number) =>
    Math.min(255, Math.max(0, Math.round(value)))
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const fonts: Fonts = { regular: loadFont(400), bold: loadFont(700) };
  let count = 0;

  await render(
    {
      title: SITE.name,
      subtitle: SITE.tagline,
      accent: "#6b8afd",
    },
    "default.png",
    fonts,
  );
  count++;

  for (const issue of getAllIssues()) {
    await render(
      {
        title: issue.description || `شمارهٔ ${issue.number}`,
        subtitle: `${toPersianDigits(issue.articleCount)} مطلب`,
        meta: formatJalali(issue.date),
        accent: solidAccent(issue.themeColor),
        badge: issue.number,
      },
      `issue-${issue.number}.png`,
      fonts,
    );
    count++;
  }

  for (const article of getAllArticles()) {
    await render(
      {
        title: article.title,
        subtitle: article.description,
        meta:
          article.authors.map((a) => a.name).join("، ") ||
          formatJalali(article.date),
        accent: solidAccent(article.issue.themeColor),
        badge: article.issueNumber,
      },
      `article-${article.issueNumber}-${article.slug}.png`,
      fonts,
    );
    count++;
  }

  for (const post of getAllBlogPosts()) {
    await render(
      {
        title: post.title,
        subtitle: post.description,
        meta: post.authors.map((a) => a.name).join("، ") || formatJalali(post.date),
        accent: "#6b8afd",
        badge: "وبلاگ",
      },
      `blog-${post.slug}.png`,
      fonts,
    );
    count++;
  }

  for (const author of getAllAuthors()) {
    await render(
      {
        title: author.name,
        subtitle: author.title,
        meta:
          author.articleCount > 0
            ? `${toPersianDigits(author.articleCount)} مطلب`
            : undefined,
        accent: "#6b8afd",
        badge: "نویسنده",
      },
      `author-${author.id}.png`,
      fonts,
    );
    count++;
  }

  console.log(`Generated ${count} Open Graph images`);
}

// Only run when invoked directly; the helpers above are imported by tests.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop()!)) {
  void main();
}
