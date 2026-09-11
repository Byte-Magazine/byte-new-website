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
const PUBLIC_DIR = join(ROOT, "public");

const WIDTH = 1200;
const HEIGHT = 630;

const COLORS = {
  background: "#12151c",
  foreground: "#f2f4f8",
  muted: "#8b93a7",
  border: "#2b3040",
};

const COVER_WIDTH = 360;
const AVATAR_SIZE = 44;

/**
 * Satori needs a static TTF; the app ships a variable WOFF2 whose `fvar` table
 * Satori's parser cannot read. The instanced weights are committed under
 * assets/fonts so the build needs no font tooling.
 */
function loadFont(weight: 400 | 700): Buffer {
  return readFileSync(join(ROOT, "assets", "fonts", `Pinar-${weight}.ttf`));
}

/** Load a public/ asset as an ArrayBuffer for Satori `<img src>`. */
function loadPublicImage(publicPath?: string): ArrayBuffer | undefined {
  if (!publicPath?.startsWith("/")) return undefined;
  // Satori rasterises JPEG/PNG/GIF/WebP — skip SVG placeholders.
  if (/\.svg$/i.test(publicPath)) return undefined;
  try {
    const buf = readFileSync(join(PUBLIC_DIR, publicPath.slice(1)));
    return buf.buffer.slice(
      buf.byteOffset,
      buf.byteOffset + buf.byteLength,
    ) as ArrayBuffer;
  } catch {
    return undefined;
  }
}

interface OgAuthor {
  name: string;
  image?: ArrayBuffer;
}

interface CardInput {
  title: string;
  /** Optional secondary line — omitted entirely when empty. */
  subtitle?: string;
  badge?: string;
  accent: string;
  authors?: OgAuthor[];
  /** Optional footer meta — omitted entirely when empty (no tagline fallback). */
  meta?: string;
  /** Issue cover / author portrait shown on the left. */
  cover?: ArrayBuffer;
}

function card({
  title,
  subtitle,
  badge,
  accent,
  authors,
  meta,
  cover,
}: CardInput) {
  const textColWidth = cover ? WIDTH - COVER_WIDTH - 40 - 128 : WIDTH - 128;
  const textMax = cover ? 26 : 34;
  const titleSize = title.length > 55 ? 46 : title.length > 40 ? 52 : 58;

  const headerChildren: unknown[] = [];

  if (badge) {
    headerChildren.push(badgeEl(badge, accent, textColWidth));
  }

  headerChildren.push(
    rtlBlock(title, textMax, {
      fontSize: titleSize,
      fontWeight: 700,
      color: COLORS.foreground,
      lineHeight: 1.45,
      width: textColWidth,
    }),
  );

  const trimmedSubtitle = subtitle?.trim();
  if (trimmedSubtitle) {
    const clipped =
      trimmedSubtitle.length > 100
        ? `${trimmedSubtitle.slice(0, 100)}…`
        : trimmedSubtitle;
    headerChildren.push(
      rtlBlock(clipped, textMax + 8, {
        fontSize: 26,
        color: COLORS.muted,
        lineHeight: 1.55,
        marginTop: 20,
        width: textColWidth,
      }),
    );
  }

  const footer = authorsFooter(authors, meta?.trim(), textColWidth);

  const textColumn = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: textColWidth,
        height: "100%",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              width: textColWidth,
            },
            children: headerChildren,
          },
        },
        footer,
      ],
    },
  };

  const bodyChildren: unknown[] = [];

  if (cover) {
    bodyChildren.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          width: COVER_WIDTH,
          height: HEIGHT - 136,
          borderRadius: 16,
          overflow: "hidden",
          border: `1px solid ${COLORS.border}`,
          flexShrink: 0,
        },
        children: [
          {
            type: "img",
            props: {
              src: cover,
              width: COVER_WIDTH,
              height: HEIGHT - 136,
              style: {
                width: COVER_WIDTH,
                height: HEIGHT - 136,
                objectFit: "cover",
              },
            },
          },
        ],
      },
    });
  }

  bodyChildren.push(textColumn);

  return {
    type: "div",
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.background,
        padding: "68px 64px",
        fontFamily: "Pinar",
        borderTop: `10px solid ${accent}`,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "stretch",
              gap: 40,
              width: "100%",
              height: "100%",
            },
            children: bodyChildren,
          },
        },
      ],
    },
  };
}

/** Badge above the title. Never letter-space Persian — it tears glyphs apart. */
function badgeEl(badge: string, accent: string, width: number) {
  const latinOrDigitsOnly = /^[\dA-Za-z0-9._\-\s]+$/.test(badge);

  if (latinOrDigitsOnly) {
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          position: "relative",
          width,
          height: 36,
          marginBottom: 22,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                right: 0,
                top: 0,
                fontSize: 24,
                color: accent,
                letterSpacing: 4,
                fontFamily: "Pinar",
              },
              children: badge,
            },
          },
        ],
      },
    };
  }

  // Persian as ONE text node (keeps ligatures), pinned to the right.
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "relative",
        width,
        height: 40,
        marginBottom: 22,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              right: 0,
              top: 0,
              fontSize: 28,
              color: accent,
              fontFamily: "Pinar",
              fontWeight: 700,
              // Keep glyph order stable for a single Persian word.
              direction: "rtl",
              unicodeBidi: "isolate",
            },
            children: badge,
          },
        },
      ],
    },
  };
}

function authorsFooter(
  authors: OgAuthor[] | undefined,
  meta: string | undefined,
  width: number,
) {
  const brand = rtlBlock("نشریه علمی بایت", 24, {
    fontSize: 24,
    color: COLORS.foreground,
    width: 280,
  });

  const trailing: unknown[] = [];

  if (authors && authors.length > 0) {
    trailing.push({
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        },
        children: authors.slice(0, 3).map((author) => authorChip(author)),
      },
    });
  } else if (meta) {
    trailing.push(
      rtlBlock(meta, 28, {
        fontSize: 22,
        color: COLORS.muted,
        width: Math.min(360, width - 300),
      }),
    );
  }

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "row",
        justifyContent: trailing.length > 0 ? "space-between" : "flex-end",
        alignItems: "center",
        borderTop: `1px solid ${COLORS.border}`,
        paddingTop: 24,
        marginTop: 28,
        width,
        gap: 20,
      },
      // Brand on the left; authors / meta packed on the right.
      children: trailing.length > 0 ? [brand, ...trailing] : [brand],
    },
  };
}

function authorChip(author: OgAuthor) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      },
      children: [
        rtlBlock(author.name, 24, {
          fontSize: 22,
          color: COLORS.muted,
          width: 220,
        }),
        author.image
          ? {
              type: "img",
              props: {
                src: author.image,
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                style: {
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  objectFit: "cover",
                  border: `1px solid ${COLORS.border}`,
                },
              },
            }
          : null,
      ].filter(Boolean),
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
 * Satori ignores `row-reverse` and has unreliable bidi for mixed Persian/Latin.
 * Keep natural wrap order, reverse each line for an LTR flex row, and pin the
 * row to `right: 0`. Each word is its own text node so shaping stays intact.
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
      lines.push(current.map(fixDigitRuns));
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length > 0) lines.push(current.map(fixDigitRuns));

  return lines;
}

function rtlBlock(
  text: string,
  maxChars: number,
  style: Record<string, unknown>,
) {
  const fontSize = Number(style.fontSize ?? 30);
  const lineHeight = Number(style.lineHeight ?? 1.45);
  const space = Math.round(fontSize * 0.32);
  const rowHeight = Math.round(fontSize * lineHeight);
  const {
    width,
    lineHeight: _lh,
    fontWeight = 400,
    color = COLORS.foreground,
    fontSize: _fs,
    ...rest
  } = style;
  const colWidth = typeof width === "number" ? width : WIDTH - 128;
  const lines = rtlLines(text, maxChars);

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: colWidth,
        ...rest,
      },
      children: lines.map((line) => ({
        type: "div",
        props: {
          style: {
            display: "flex",
            position: "relative",
            width: colWidth,
            height: rowHeight,
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "row",
                  position: "absolute",
                  right: 0,
                  top: 0,
                  height: rowHeight,
                  alignItems: "center",
                },
                children: [...line].reverse().map((word, index) => ({
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      fontSize,
                      fontWeight,
                      color,
                      marginLeft: index === 0 ? 0 : space,
                    },
                    children: word,
                  },
                })),
              },
            },
          ],
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

function toOgAuthors(
  authors: { name: string; image?: string }[],
): OgAuthor[] | undefined {
  if (authors.length === 0) return undefined;
  return authors.map((author) => ({
    name: author.name,
    image: loadPublicImage(author.image),
  }));
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
        cover: loadPublicImage(issue.cover),
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
        accent: solidAccent(article.issue.themeColor),
        badge: article.issueNumber,
        authors: toOgAuthors(article.authors),
        meta: formatJalali(article.date),
        cover: loadPublicImage(article.issue.cover),
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
        accent: "#6b8afd",
        badge: "وبلاگ",
        authors: toOgAuthors(post.authors),
        meta: formatJalali(post.date),
      },
      `blog-${post.slug}.png`,
      fonts,
    );
    count++;
  }

  for (const author of getAllAuthors()) {
    const title = author.title?.trim();
    const meta =
      author.articleCount > 0
        ? `${toPersianDigits(author.articleCount)} مطلب`
        : undefined;

    await render(
      {
        title: author.name,
        // Only render a subtitle when the author actually has one.
        ...(title ? { subtitle: title } : {}),
        ...(meta ? { meta } : {}),
        accent: "#6b8afd",
        badge: "نویسنده",
        cover: loadPublicImage(author.image),
      },
      `author-${author.id}.png`,
      fonts,
    );
    count++;
  }

  console.log(`Generated ${count} Open Graph images`);
}

// Only run when invoked directly; the helpers above are imported by tests.
if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].split("/").pop()!)
) {
  void main();
}
