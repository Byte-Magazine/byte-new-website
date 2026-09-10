# Byte New Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Byte publication website as a statically-exported Next.js 16 + shadcn application, migrating all Docusaurus content and resolving every derived value at build time.

**Architecture:** A one-time migration script converts `byte-site/` content into a normalized `content/` directory. A single memoized content-graph module reads that directory at build time and exposes a fully-resolved, frozen object graph (articles, authors, issues, tags, with inverse relations already computed). Every route reads from the graph via `generateStaticParams`, so `next build` emits a complete static site with no runtime data access.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), React 19, TypeScript strict, Tailwind v4, shadcn v4 (`base-lyra`/zinc/rtl), motion v13, React Bits, next-mdx-remote-client, gray-matter, Zod, Shiki, KaTeX, Vitest, pnpm 10.18.2.

**Spec:** `docs/superpowers/specs/2026-09-10-byte-new-website-design.md`

## Global Constraints

- Static export only: `output: "export"`, `images.unoptimized: true`, `trailingSlash: true`, `dynamicParams = false`. No API routes, no ISR, no server runtime.
- All derived data (counts, relations, search index) computed at build time. Never in the browser, never at request time.
- Legacy URLs preserved exactly: `/mags/intro`, `/mags/[issue]`, `/mags/[issue]/[article]`, `/blog`, `/blog/[...slug]`, `/workshops/[workshop]/[...slug]`, `/staff`, `/authors`, `/codenameh`.
- Document direction is RTL (`dir="rtl"` on `<html>`, `lang="fa"`). All spacing uses logical properties (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`), never `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`.
- Dates stored ISO in frontmatter, rendered Jalali via `Intl.DateTimeFormat("fa-IR-u-ca-persian")`. No date library.
- PDF URLs: `${NEXT_PUBLIC_PDF_BASE_URL}/mags/<issue>.pdf`, default base `https://byte-mag.s3.ir-thr-at1.arvanstorage.ir`.
- Persian prose inside articles is never edited. Only frontmatter, imports, and admonition syntax are rewritten.
- Package manager is pnpm 10.18.2. Node >= 20.
- Both light and dark themes fully specified; system-following by default.
- All motion respects `prefers-reduced-motion`.

## File Structure

```
byte-new-website/
  app/
    layout.tsx                     root: fonts, theme, dir=rtl, header/footer
    page.tsx                       landing
    globals.css                    Tailwind v4 + design tokens
    not-found.tsx
    sitemap.ts  robots.ts
    articles/page.tsx              flat filterable index
    mags/intro/page.tsx
    mags/[issue]/page.tsx
    mags/[issue]/[article]/page.tsx
    blog/page.tsx
    blog/[...slug]/page.tsx
    workshops/page.tsx
    workshops/[workshop]/[...slug]/page.tsx
    authors/page.tsx  authors/[id]/page.tsx
    tags/[tag]/page.tsx
    staff/page.tsx
    codenameh/page.tsx
  lib/
    content/
      schema.ts                    Zod frontmatter schemas + derived types
      read.ts                      filesystem reading, gray-matter parsing
      graph.ts                     builds + memoizes the resolved graph
      index.ts                     public API re-exports
    persian.ts                     digits, normalization, Jalali, reading time
    mdx/
      options.ts                   shared remark/rehype plugin chain
      remark-admonition.ts         ::: -> <Callout>
      components.tsx               global MDX component scope
    site.ts                        site constants, nav, PDF url builder
    utils.ts                       cn()
  components/
    ui/                            shadcn primitives
    layout/                        header, footer, nav, theme toggle, search
    content/                       Callout, Tooltip, Timeline, AuthorChip, Mermaid, TOC
    cards/                         ArticleCard, IssueCard, AuthorCard, StaffCard
    motion/                        React Bits wrappers + reduced-motion guards
    sections/                      landing sections
  content/                         migrated output (git-tracked)
  scripts/
    migrate.ts                     legacy -> content/
    generate-og.ts                 build-time OG images
  public/
    fonts/  img/  search-index.json  og/
```

---

### Task 1: Project scaffold and toolchain

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `components.json`, `.gitignore`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `lib/utils.ts`
- Test: `lib/utils.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `cn(...inputs: ClassValue[]): string` from `@/lib/utils`; a buildable Next.js app; `pnpm dev|build|test|typecheck|lint` scripts

- [ ] **Step 1: Create package.json**

```json
{
  "name": "byte-new-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "migrate": "tsx scripts/migrate.ts",
    "generate:og": "tsx scripts/generate-og.ts"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "gray-matter": "^4.0.3",
    "katex": "^0.16.22",
    "lucide-react": "^1.37.0",
    "motion": "^13.1.1",
    "next": "16.3.3",
    "next-mdx-remote-client": "^2.1.6",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-katex": "^7.0.1",
    "rehype-pretty-code": "^0.14.5",
    "rehype-slug": "^6.0.0",
    "remark-gfm": "^4.0.1",
    "remark-math": "^6.0.0",
    "shiki": "^4.4.3",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "unist-util-visit": "^5.0.0",
    "zod": "^4.5.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^6.1.1",
    "eslint": "^9",
    "eslint-config-next": "16.3.3",
    "shadcn": "^4.19.0",
    "tailwindcss": "^4",
    "tsx": "^4.19.2",
    "typescript": "^5",
    "vitest": "^4.1.11"
  },
  "packageManager": "pnpm@10.18.2"
}
```

Run `pnpm install`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out", ".next"]
}
```

- [ ] **Step 3: Create next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
```

- [ ] **Step 4: Create postcss.config.mjs, eslint.config.mjs, vitest.config.ts**

```js
// postcss.config.mjs
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

```js
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: ["out/**", ".next/**", "content/**", "node_modules/**"] },
];
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "node", include: ["**/*.test.ts", "**/*.test.tsx"] },
  resolve: { alias: { "@": resolve(__dirname, ".") } },
});
```

- [ ] **Step 5: Create components.json**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-lyra",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": { "@react-bits": "https://reactbits.dev/r/{name}.json" }
}
```

- [ ] **Step 6: Write the failing test for cn()**

```ts
// lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resolves conflicting tailwind classes to the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `pnpm test lib/utils.test.ts`
Expected: FAIL — cannot resolve `./utils`

- [ ] **Step 8: Implement lib/utils.ts**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `pnpm test lib/utils.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 10: Create minimal globals.css, layout.tsx, page.tsx**

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نشریه‌ی علمی فرهنگی بایت",
  description: "دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// app/page.tsx
export default function Home() {
  return <main>بایت</main>;
}
```

- [ ] **Step 11: Verify the build works**

Run: `pnpm build`
Expected: exits 0, creates `out/index.html`

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 static-export project"
```

---

### Task 2: Persian text utilities

**Files:**
- Create: `lib/persian.ts`
- Test: `lib/persian.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `toPersianDigits(input: string | number): string`
  - `normalizePersian(input: string): string` — folds ي→ی, ك→ک, strips ZWNJ/diacritics/tatweel, collapses whitespace, lowercases
  - `formatJalali(iso: string): string` — `"۱۴۰۴/۰۶/۳۱"`
  - `formatJalaliLong(iso: string): string` — `"۳۱ شهریور ۱۴۰۴"`
  - `readingTimeMinutes(text: string): number`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/persian.test.ts
import { describe, it, expect } from "vitest";
import {
  toPersianDigits,
  normalizePersian,
  formatJalali,
  formatJalaliLong,
  readingTimeMinutes,
} from "./persian";

describe("toPersianDigits", () => {
  it("converts ASCII digits", () => {
    expect(toPersianDigits("2025")).toBe("۲۰۲۵");
  });
  it("accepts numbers", () => {
    expect(toPersianDigits(95)).toBe("۹۵");
  });
  it("leaves non-digits untouched", () => {
    expect(toPersianDigits("v1.2")).toBe("v۱.۲");
  });
});

describe("normalizePersian", () => {
  it("folds Arabic yeh to Persian yeh", () => {
    expect(normalizePersian("علي")).toBe(normalizePersian("علی"));
  });
  it("folds Arabic kaf to Persian kaf", () => {
    expect(normalizePersian("كتاب")).toBe(normalizePersian("کتاب"));
  });
  it("strips ZWNJ", () => {
    expect(normalizePersian("می‌شود")).toBe("میشود");
  });
  it("collapses whitespace and lowercases latin", () => {
    expect(normalizePersian("  Quantum   Computing ")).toBe("quantum computing");
  });
});

describe("formatJalali", () => {
  it("formats an ISO date as a Jalali slash date in Persian digits", () => {
    expect(formatJalali("2025-09-22")).toBe("۱۴۰۴/۰۶/۳۱");
  });
});

describe("formatJalaliLong", () => {
  it("formats an ISO date with the Persian month name", () => {
    expect(formatJalaliLong("2025-09-22")).toContain("شهریور");
    expect(formatJalaliLong("2025-09-22")).toContain("۱۴۰۴");
  });
});

describe("readingTimeMinutes", () => {
  it("returns at least 1 minute for short text", () => {
    expect(readingTimeMinutes("سلام دنیا")).toBe(1);
  });
  it("scales with word count at 200 wpm", () => {
    const text = Array.from({ length: 600 }, () => "کلمه").join(" ");
    expect(readingTimeMinutes(text)).toBe(3);
  });
  it("ignores markdown syntax and code fences", () => {
    const withCode = "سلام\n\n```js\n" + Array.from({ length: 600 }, () => "word").join(" ") + "\n```\n";
    expect(readingTimeMinutes(withCode)).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/persian.test.ts`
Expected: FAIL — cannot resolve `./persian`

- [ ] **Step 3: Implement lib/persian.ts**

```ts
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Folds the character variants that make Persian search unreliable:
 * Arabic yeh/kaf vs Persian, ZWNJ, diacritics, tatweel.
 */
export function normalizePersian(input: string): string {
  return input
    .replace(/[يى]/g, "ی") // ي, ى -> ی
    .replace(/ك/g, "ک") // ك -> ک
    .replace(/[ً-ٰٟ]/g, "") // diacritics
    .replace(/ـ/g, "") // tatweel
    .replace(/[​-‏ - ]/g, "") // ZWNJ and friends
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function jalaliParts(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  const fmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function formatJalali(iso: string): string {
  const { year, month, day } = jalaliParts(iso);
  return `${year}/${month}/${day}`;
}

export function formatJalaliLong(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>[\]()!-]/g, " ");
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/persian.test.ts`
Expected: PASS. If `formatJalali` returns digits with an Arabic-Indic variant or an embedded RTL mark, adjust the implementation to strip `؜` and map to the `PERSIAN_DIGITS` set — do not weaken the test.

- [ ] **Step 5: Commit**

```bash
git add lib/persian.ts lib/persian.test.ts
git commit -m "feat: add Persian text, date, and reading-time utilities"
```

---

### Task 3: Content schema and site config

**Files:**
- Create: `lib/content/schema.ts`, `lib/site.ts`
- Test: `lib/content/schema.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `articleFrontmatterSchema`, `blogFrontmatterSchema`, `workshopFrontmatterSchema`, `issueMetaSchema`, `authorSchema`, `staffSectionSchema`, `codenamehSchema` (Zod schemas)
  - Types: `ArticleFrontmatter`, `BlogFrontmatter`, `WorkshopFrontmatter`, `IssueMeta`, `AuthorRecord`, `StaffSection`, `CodenamehEntry`
  - Resolved types: `Author`, `Article`, `Issue`, `BlogPost`, `WorkshopDoc`, `Workshop`, `Tag`, `ContentGraph`
  - `lib/site.ts`: `SITE` constant, `NAV_ITEMS`, `pdfUrl(issue: string): string`

- [ ] **Step 1: Write the failing test**

```ts
// lib/content/schema.test.ts
import { describe, it, expect } from "vitest";
import { articleFrontmatterSchema, issueMetaSchema, authorSchema } from "./schema";

describe("articleFrontmatterSchema", () => {
  const valid = {
    title: "رایانش کوانتومی",
    description: "توضیح",
    authors: ["AmirMahdiHedayati"],
    tags: ["Quantum Computing"],
    date: "2025-09-22",
    issue: "00000101",
    order: 1,
  };

  it("accepts a valid article", () => {
    expect(articleFrontmatterSchema.parse(valid)).toMatchObject(valid);
  });

  it("defaults missing tags and authors to empty arrays", () => {
    const { tags, authors, ...rest } = valid;
    const parsed = articleFrontmatterSchema.parse(rest);
    expect(parsed.tags).toEqual([]);
    expect(parsed.authors).toEqual([]);
  });

  it("rejects a non-ISO date", () => {
    expect(() => articleFrontmatterSchema.parse({ ...valid, date: "۱۴۰۴/۰۶/۳۱" })).toThrow();
  });

  it("rejects a missing title", () => {
    const { title, ...rest } = valid;
    expect(() => articleFrontmatterSchema.parse(rest)).toThrow();
  });
});

describe("issueMetaSchema", () => {
  it("accepts a valid issue", () => {
    const issue = {
      number: "00000101",
      title: "00000101",
      description: "شماره پنجم",
      date: "2025-09-22",
      cover: "/img/00000101.png",
      themeColor: "rgba(213,169,33,0.4)",
    };
    expect(issueMetaSchema.parse(issue)).toMatchObject(issue);
  });

  it("rejects an issue number that is not 8 binary digits", () => {
    expect(() =>
      issueMetaSchema.parse({
        number: "5",
        title: "5",
        description: "",
        date: "2025-09-22",
        cover: "/img/x.png",
        themeColor: "rgba(0,0,0,0.4)",
      }),
    ).toThrow();
  });
});

describe("authorSchema", () => {
  it("accepts an author with partial socials", () => {
    const parsed = authorSchema.parse({
      id: "Moeein",
      name: "معین آعلی",
      title: "کارشناسی ۱۴۰۱",
      image: "/img/staff/moeein.jpg",
      socials: { github: "https://github.com/moeeinaali" },
    });
    expect(parsed.socials.github).toBe("https://github.com/moeeinaali");
    expect(parsed.socials.linkedin).toBeUndefined();
  });

  it("defaults socials to an empty object", () => {
    const parsed = authorSchema.parse({ id: "X", name: "ایکس" });
    expect(parsed.socials).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/content/schema.test.ts`
Expected: FAIL — cannot resolve `./schema`

- [ ] **Step 3: Implement lib/content/schema.ts**

```ts
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
  })
  .default({});

export const authorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  title: z.string().optional(),
  image: z.string().optional(),
  bio: z.string().optional(),
  socials: socialsSchema,
});

export const staffMemberSchema = z.object({
  authorId: z.string().optional(),
  name: z.string().min(1),
  title: z.string().optional(),
  image: z.string().optional(),
  socials: socialsSchema,
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
export type StaffMember = z.infer<typeof staffMemberSchema>;
export type StaffSection = z.infer<typeof staffSectionSchema>;
export type IssueMeta = z.infer<typeof issueMetaSchema>;
export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type WorkshopFrontmatter = z.infer<typeof workshopFrontmatterSchema>;
export type CodenamehEntry = z.infer<typeof codenamehSchema>;

/** Resolved graph types. Relations are populated at build time. */
export interface Author extends AuthorRecord {
  slug: string;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/content/schema.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Implement lib/site.ts**

```ts
export const SITE = {
  name: "نشریه‌ی علمی فرهنگی بایت",
  shortName: "بایت",
  tagline: "دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
  description:
    "نشریه‌ی علمی فرهنگی بایت، دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف",
  url: "https://byte-mag.ir",
  locale: "fa_IR",
  github: "https://github.com/Byte-Magazine",
  copyright:
    "© نشریه‌ی علمی فرهنگی بایت - دانشکده مهندسی کامپیوتر - دانشگاه صنعتی شریف",
} as const;

const PDF_BASE =
  process.env.NEXT_PUBLIC_PDF_BASE_URL ??
  "https://byte-mag.s3.ir-thr-at1.arvanstorage.ir";

export function pdfUrl(issue: string): string {
  return `${PDF_BASE}/mags/${issue}.pdf`;
}

export const NAV_ITEMS = [
  { href: "/mags/intro", label: "آرشیو بایت" },
  { href: "/articles", label: "مقاله‌ها" },
  { href: "/codenameh", label: "آرشیو کدنامه" },
  { href: "/workshops", label: "کارگاه‌ها" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/staff", label: "اعضای مرکزی" },
  { href: "/authors", label: "نویسندگان" },
] as const;
```

- [ ] **Step 6: Commit**

```bash
git add lib/content/schema.ts lib/content/schema.test.ts lib/site.ts
git commit -m "feat: add content schemas and site configuration"
```

---

### Task 4: Migration script — transforms

**Files:**
- Create: `scripts/lib/transform.ts`
- Test: `scripts/lib/transform.test.ts`

**Interfaces:**
- Consumes: `normalizePersian` from `@/lib/persian`
- Produces:
  - `stripSiteImports(body: string): string`
  - `convertAdmonitions(body: string): string`
  - `normalizeTag(tag: string): string`
  - `buildTagMap(tags: string[]): Map<string, string>` — variant → canonical
  - `parseOrderFromDirname(dirname: string): { order: number; slug: string }`
  - `rewriteImagePaths(body: string, articleSlug: string): string`

- [ ] **Step 1: Write the failing tests**

```ts
// scripts/lib/transform.test.ts
import { describe, it, expect } from "vitest";
import {
  stripSiteImports,
  convertAdmonitions,
  normalizeTag,
  buildTagMap,
  parseOrderFromDirname,
} from "./transform";

describe("stripSiteImports", () => {
  it("removes @site imports", () => {
    const input = 'import Tooltip from "@site/src/components/Tooltip";\n\nمتن';
    expect(stripSiteImports(input).trim()).toBe("متن");
  });

  it("removes multiple imports and collapses blank lines", () => {
    const input =
      'import A from "@site/a";\nimport B from "@site/b";\n\n# عنوان';
    expect(stripSiteImports(input).trim()).toBe("# عنوان");
  });

  it("keeps non-@site imports untouched", () => {
    const input = 'import X from "./x";\n\nمتن';
    expect(stripSiteImports(input)).toContain('import X from "./x"');
  });
});

describe("convertAdmonitions", () => {
  it("converts a simple tip", () => {
    const input = ":::tip\nمحتوا\n:::";
    expect(convertAdmonitions(input)).toBe('<Callout type="tip">\nمحتوا\n</Callout>');
  });

  it("converts an admonition with a title", () => {
    const input = ":::warning هشدار\nمحتوا\n:::";
    expect(convertAdmonitions(input)).toBe(
      '<Callout type="warning" title="هشدار">\nمحتوا\n</Callout>',
    );
  });

  it("converts all five types", () => {
    for (const type of ["danger", "info", "note", "tip", "warning"]) {
      expect(convertAdmonitions(`:::${type}\nx\n:::`)).toContain(`type="${type}"`);
    }
  });

  it("does not touch ::: inside a fenced code block", () => {
    const input = "```md\n:::tip\nنمونه\n:::\n```";
    expect(convertAdmonitions(input)).toBe(input);
  });

  it("converts two consecutive admonitions", () => {
    const input = ":::tip\nیک\n:::\n\n:::info\nدو\n:::";
    const out = convertAdmonitions(input);
    expect(out).toContain('<Callout type="tip">');
    expect(out).toContain('<Callout type="info">');
    expect(out).not.toContain(":::");
  });
});

describe("normalizeTag", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeTag("  Quantum   Computing  ")).toBe("Quantum Computing");
  });
  it("preserves original casing of the display form", () => {
    expect(normalizeTag("DevOps")).toBe("DevOps");
  });
});

describe("buildTagMap", () => {
  it("maps Arabic-yeh variants to a single canonical tag", () => {
    const map = buildTagMap(["برنامه‌نويسی", "برنامه‌نویسی", "برنامه‌نویسی"]);
    const canonical = map.get("برنامه‌نويسی");
    expect(canonical).toBe(map.get("برنامه‌نویسی"));
  });

  it("picks the most frequent variant as canonical", () => {
    const map = buildTagMap(["DevOps", "devops", "devops"]);
    expect(map.get("DevOps")).toBe("devops");
  });

  it("leaves genuinely distinct tags alone", () => {
    const map = buildTagMap(["Go", "Rust"]);
    expect(map.get("Go")).toBe("Go");
    expect(map.get("Rust")).toBe("Rust");
  });
});

describe("parseOrderFromDirname", () => {
  it("splits the NN- prefix into order and slug", () => {
    expect(parseOrderFromDirname("01-quantum")).toEqual({ order: 1, slug: "quantum" });
  });
  it("handles a two-digit order", () => {
    expect(parseOrderFromDirname("17-firmware")).toEqual({ order: 17, slug: "firmware" });
  });
  it("handles a missing prefix", () => {
    expect(parseOrderFromDirname("intro")).toEqual({ order: 0, slug: "intro" });
  });
  it("keeps hyphens inside the slug", () => {
    expect(parseOrderFromDirname("05-distributed-systems")).toEqual({
      order: 5,
      slug: "distributed-systems",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test scripts/lib/transform.test.ts`
Expected: FAIL — cannot resolve `./transform`

- [ ] **Step 3: Implement scripts/lib/transform.ts**

```ts
import { normalizePersian } from "../../lib/persian";

export function stripSiteImports(body: string): string {
  return body
    .replace(/^import\s+.*?from\s+["']@site\/[^"']*["'];?\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

const ADMONITION_TYPES = ["danger", "info", "note", "tip", "warning", "caution"] as const;

/**
 * Walks the document line by line so fenced code blocks are skipped.
 * A regex alone would corrupt ::: examples inside code samples.
 */
export function convertAdmonitions(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  const openStack: string[] = [];
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
      } else if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      out.push(line);
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    const open = line.match(/^:::(\w+)[ \t]*(.*)$/);
    if (open && (ADMONITION_TYPES as readonly string[]).includes(open[1])) {
      const type = open[1] === "caution" ? "warning" : open[1];
      const title = open[2].trim();
      openStack.push(type);
      out.push(
        title
          ? `<Callout type="${type}" title="${title.replace(/"/g, "&quot;")}">`
          : `<Callout type="${type}">`,
      );
      continue;
    }

    if (/^:::\s*$/.test(line) && openStack.length > 0) {
      openStack.pop();
      out.push("</Callout>");
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

export function normalizeTag(tag: string): string {
  return tag.replace(/\s+/g, " ").trim();
}

/**
 * Groups tags whose normalized forms collide (ی/ي, ک/ك, casing, ZWNJ)
 * and elects the most frequent surface form as canonical.
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
    let canonical = "";
    let best = -1;
    for (const [form, count] of counts) {
      if (count > best) {
        best = count;
        canonical = form;
      }
    }
    for (const form of counts.keys()) map.set(form, canonical);
  }
  return map;
}

export function parseOrderFromDirname(dirname: string): { order: number; slug: string } {
  const match = dirname.match(/^(\d+)-(.+)$/);
  if (!match) return { order: 0, slug: dirname };
  return { order: Number(match[1]), slug: match[2] };
}

export function rewriteImagePaths(body: string, articleSlug: string): string {
  return body
    .replace(/!\[([^\]]*)\]\(\.\/img\//g, `![$1](./img/`)
    .replace(/src=["']\.\/img\//g, `src="./img/`)
    .replace(/\]\(img\//g, `](./img/`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test scripts/lib/transform.test.ts`
Expected: PASS (16 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/transform.ts scripts/lib/transform.test.ts
git commit -m "feat: add content migration transforms"
```

---

### Task 5: Migration script — people merge

**Files:**
- Create: `scripts/lib/people.ts`
- Test: `scripts/lib/people.test.ts`

**Interfaces:**
- Consumes: `AuthorRecord`, `StaffSection` from `@/lib/content/schema`
- Produces:
  - `mergeAuthors(magsAuthors, blogAuthors, staffSections): { authors: AuthorRecord[]; staff: StaffSection[]; warnings: string[] }`
  - `expandSocialUrl(platform: string, value: string): string` — bare handles → full URLs

- [ ] **Step 1: Write the failing tests**

```ts
// scripts/lib/people.test.ts
import { describe, it, expect } from "vitest";
import { mergeAuthors, expandSocialUrl } from "./people";

describe("expandSocialUrl", () => {
  it("expands a bare github handle", () => {
    expect(expandSocialUrl("github", "spneshaei")).toBe("https://github.com/spneshaei");
  });
  it("expands a bare linkedin handle", () => {
    expect(expandSocialUrl("linkedin", "moeein")).toBe("https://www.linkedin.com/in/moeein");
  });
  it("passes a full URL through unchanged", () => {
    expect(expandSocialUrl("github", "https://github.com/EmadEJ")).toBe(
      "https://github.com/EmadEJ",
    );
  });
});

describe("mergeAuthors", () => {
  const mags = {
    Moeein: {
      name: "معین آعلی",
      title: "کارشناسی ۱۴۰۱",
      image_url: "/img/staff/moeein.jpg",
      socials: { github: "https://github.com/moeeinaali" },
    },
  };
  const blog = {
    Moeein: {
      name: "معین آعلی",
      title: "کارشناسی ۱۴۰۱",
      image_url: "/img/staff/moeein.jpg",
      socials: { github: "moeeinaali", linkedin: "moeein" },
    },
    Alinejad: {
      name: "مهدی علی‌نژاد",
      image_url: "/img/staff/MahdiAlinejhad.jpg",
      socials: {},
    },
  };
  const staff = [
    {
      name: "صفحه‌آرایی و گرافیک",
      staffList: [
        {
          name: "معین آعلی",
          title: "کارشناسی ۱۴۰۱",
          imageURL: "/img/staff/moeein.jpg",
          socials: {},
        },
      ],
    },
  ];

  it("produces one record per unique author id", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    expect(authors.map((a) => a.id).sort()).toEqual(["Alinejad", "Moeein"]);
  });

  it("unions socials across sources and expands handles", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    const moeein = authors.find((a) => a.id === "Moeein")!;
    expect(moeein.socials.github).toBe("https://github.com/moeeinaali");
    expect(moeein.socials.linkedin).toBe("https://www.linkedin.com/in/moeein");
  });

  it("links a staff member to an author id by matching name", () => {
    const { staff: sections } = mergeAuthors(mags, blog, staff);
    expect(sections[0].members[0].authorId).toBe("Moeein");
  });

  it("warns about a staff member with no matching author", () => {
    const orphan = [
      { name: "بخش", staffList: [{ name: "ناشناس", socials: {} }] },
    ];
    const { warnings } = mergeAuthors(mags, blog, orphan);
    expect(warnings.some((w) => w.includes("ناشناس"))).toBe(true);
  });

  it("maps image_url to image", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    expect(authors.find((a) => a.id === "Alinejad")!.image).toBe(
      "/img/staff/MahdiAlinejhad.jpg",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test scripts/lib/people.test.ts`
Expected: FAIL — cannot resolve `./people`

- [ ] **Step 3: Implement scripts/lib/people.ts**

```ts
import { normalizePersian } from "../../lib/persian";
import type { AuthorRecord, StaffSection } from "../../lib/content/schema";

type LegacyPerson = {
  name: string;
  title?: string;
  image_url?: string;
  url?: string;
  socials?: Record<string, string>;
};

type LegacyStaff = {
  name: string;
  staffList: Array<{
    name: string;
    title?: string;
    imageURL?: string;
    socials?: Record<string, string>;
  }>;
};

const SOCIAL_BASES: Record<string, string> = {
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/in/",
  x: "https://x.com/",
};

export function expandSocialUrl(platform: string, value: string): string {
  if (!value) return value;
  if (/^https?:\/\//.test(value)) return value;
  const base = SOCIAL_BASES[platform];
  return base ? `${base}${value.replace(/^@/, "")}` : value;
}

function expandSocials(socials: Record<string, string> = {}) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(socials)) {
    if (value) out[key] = expandSocialUrl(key, value);
  }
  return out;
}

export function mergeAuthors(
  magsAuthors: Record<string, LegacyPerson>,
  blogAuthors: Record<string, LegacyPerson>,
  staffSections: LegacyStaff[],
): { authors: AuthorRecord[]; staff: StaffSection[]; warnings: string[] } {
  const warnings: string[] = [];
  const byId = new Map<string, AuthorRecord>();

  const ingest = (source: Record<string, LegacyPerson>) => {
    for (const [id, person] of Object.entries(source)) {
      const existing = byId.get(id);
      const record: AuthorRecord = {
        id,
        name: person.name,
        title: person.title ?? existing?.title,
        image: person.image_url ?? existing?.image,
        socials: { ...(existing?.socials ?? {}), ...expandSocials(person.socials) },
      };
      byId.set(id, record);
    }
  };

  ingest(magsAuthors);
  ingest(blogAuthors);

  const byName = new Map<string, string>();
  for (const author of byId.values()) {
    byName.set(normalizePersian(author.name), author.id);
  }

  const staff: StaffSection[] = staffSections.map((section) => ({
    name: section.name,
    members: section.staffList.map((member) => {
      const authorId = byName.get(normalizePersian(member.name));
      if (!authorId) {
        warnings.push(
          `staff member "${member.name}" in section "${section.name}" has no matching author record`,
        );
      }
      return {
        authorId,
        name: member.name,
        title: member.title,
        image: member.imageURL,
        socials: expandSocials(member.socials),
      };
    }),
  }));

  return {
    authors: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
    staff,
    warnings,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test scripts/lib/people.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/people.ts scripts/lib/people.test.ts
git commit -m "feat: add author and staff merge logic"
```

---

### Task 6: Migration script — runner

**Files:**
- Create: `scripts/migrate.ts`
- Modify: none
- Output: `content/**`, `public/img/**`, `public/fonts/**`, `migration-report.md`

**Interfaces:**
- Consumes: everything from Tasks 4 and 5, plus the schemas from Task 3
- Produces: the populated `content/` directory. No exported API — this is a CLI.

- [ ] **Step 1: Write the runner**

Read `BYTE_LEGACY_PATH` (default `../byte-site`). Steps, in order:

1. Clear `content/` and recreate it.
2. Read `src/data/FEATURE_LIST.ts` and `src/data/STAFF_SECTION_LIST.ts` by stripping the `export const X =` prefix and `.reverse()` suffix, then evaluating the array literal with `JSON5`-style tolerance — simplest robust approach: `new Function("return " + literal)()`. These files are trusted repo content.
3. For each issue in `featureList`: convert the Jalali `date` (`"۱۴۰۴/۰۶/۳۱"`) to ISO via a small Jalali→Gregorian conversion, write `content/issues/<number>/meta.json` validated by `issueMetaSchema`.
4. For each `mags/<issue>/<NN-slug>/index.mdx`: parse frontmatter, apply `stripSiteImports` then `convertAdmonitions`, derive `order`/`slug` via `parseOrderFromDirname`, set `date` from the issue, set `cover` to the first co-located image if present, map tags through the tag map, write `content/issues/<issue>/<slug>/index.mdx`, copy `img/` alongside.
5. Same for `blog/**` (date parsed from the `MM-DD-slug` directory under a year directory) and `workshops/**`.
6. Merge people via `mergeAuthors`; write `content/people/authors.json` and `content/people/staff.json`.
7. Build `content/codenameh.json` from `codenamehList`, with `era` from the group name and `number` parsed from `codenameh_N`.
8. Copy `static/img/**` → `public/img/**` and `static/fonts/**` → `public/fonts/**`.
9. Write `migration-report.md`: counts, the full tag-merge table, unknown JSX tags found in bodies, unresolved author ids, missing images, and all warnings.

Jalali→Gregorian conversion (needed for issue dates, no dependency):

```ts
function jalaliToGregorian(jy: number, jm: number, jd: number): string {
  const gy = jy <= 979 ? 621 : 1600;
  let jy2 = jy <= 979 ? jy : jy - 979;
  let days =
    365 * jy2 +
    Math.floor(jy2 / 33) * 8 +
    Math.floor(((jy2 % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  let gy2 = gy + 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy2 += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy2 += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy2 += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const leap =
    (gy2 % 4 === 0 && gy2 % 100 !== 0) || gy2 % 400 === 0;
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > monthDays[gm]; gm++) gd -= monthDays[gm];
  return `${gy2}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}
```

- [ ] **Step 2: Run the migration**

Run: `pnpm migrate`
Expected: exits 0, prints a summary, writes `migration-report.md`

- [ ] **Step 3: Verify the output**

```bash
ls content/issues | wc -l          # 8
find content/issues -name index.mdx | wc -l   # 94
grep -rl '@site/' content/ | wc -l # 0
grep -rl '^:::' content/ | wc -l   # 0
node -e "const a=require('./content/people/authors.json');console.log(a.length)"  # ~70
```

- [ ] **Step 4: Read migration-report.md and fix any unresolved items**

Any unknown JSX tag, unresolved author id, or missing image listed in the report must be resolved — either by handling it in the script or by recording it as an accepted exception in the report itself.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate.ts content public/img public/fonts migration-report.md
git commit -m "feat: migrate legacy Docusaurus content to content/"
```

---

### Task 7: Content graph

**Files:**
- Create: `lib/content/read.ts`, `lib/content/graph.ts`, `lib/content/index.ts`
- Test: `lib/content/graph.test.ts`

**Interfaces:**
- Consumes: schemas and types from Task 3; the `content/` directory from Task 6
- Produces (from `@/lib/content`):
  - `getGraph(): ContentGraph`
  - `getAllArticles(): Article[]` (newest first, then issue order)
  - `getArticle(issue: string, slug: string): Article | undefined`
  - `getAllIssues(): Issue[]` (newest first)
  - `getIssue(number: string): Issue | undefined`
  - `getAllAuthors(): Author[]` (by article count desc)
  - `getAuthor(id: string): Author | undefined`
  - `getAllTags(): Tag[]`, `getTag(slug: string): Tag | undefined`
  - `getAllBlogPosts(): BlogPost[]`, `getBlogPost(slug: string): BlogPost | undefined`
  - `getAllWorkshops(): Workshop[]`, `getWorkshop(slug: string): Workshop | undefined`
  - `getWorkshopDoc(workshop: string, slug: string): WorkshopDoc | undefined`
  - `getStaffSections(): StaffSection[]`, `getCodenameh(): CodenamehEntry[]`
  - `getRelatedArticles(article: Article, limit?: number): Article[]`
  - `getAdjacentArticles(article: Article): { prev?: Article; next?: Article }`
  - `getStats(): { articles: number; authors: number; issues: number; codenameh: number; workshops: number; blogPosts: number }`

`ContentGraph` shape:

```ts
export interface ContentGraph {
  articles: Article[];
  articlesByKey: Map<string, Article>;   // `${issue}/${slug}`
  issues: Issue[];
  issuesByNumber: Map<string, Issue>;
  authors: Author[];
  authorsById: Map<string, Author>;
  tags: Tag[];
  tagsBySlug: Map<string, Tag>;
  blogPosts: BlogPost[];
  blogPostsBySlug: Map<string, BlogPost>;
  workshops: Workshop[];
  workshopsBySlug: Map<string, Workshop>;
  staff: StaffSection[];
  codenameh: CodenamehEntry[];
}
```

- [ ] **Step 1: Write the failing tests**

```ts
// lib/content/graph.test.ts
import { describe, it, expect } from "vitest";
import {
  getGraph,
  getAllArticles,
  getAllIssues,
  getAllAuthors,
  getAuthor,
  getAllTags,
  getRelatedArticles,
  getAdjacentArticles,
  getStats,
} from "./index";

describe("content graph", () => {
  it("loads all 8 issues", () => {
    expect(getAllIssues()).toHaveLength(8);
  });

  it("loads every article", () => {
    expect(getAllArticles().length).toBeGreaterThanOrEqual(90);
  });

  it("sorts issues newest first", () => {
    const issues = getAllIssues();
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i - 1].date >= issues[i].date).toBe(true);
    }
  });

  it("resolves article authors to author objects", () => {
    const withAuthors = getAllArticles().find((a) => a.authors.length > 0)!;
    expect(withAuthors.authors[0].name).toBeTruthy();
    expect(withAuthors.authors[0].url).toMatch(/^\/authors\//);
  });

  it("computes each author's article count at build time", () => {
    const author = getAllAuthors().find((a) => a.articleCount > 0)!;
    expect(author.articles).toHaveLength(author.articleCount);
    for (const article of author.articles) {
      expect(article.authors.some((x) => x.id === author.id)).toBe(true);
    }
  });

  it("assigns every article to an issue and back", () => {
    for (const issue of getAllIssues()) {
      expect(issue.articleCount).toBe(issue.articles.length);
      for (const article of issue.articles) {
        expect(article.issue.number).toBe(issue.number);
      }
    }
  });

  it("orders articles within an issue by their order field", () => {
    for (const issue of getAllIssues()) {
      const orders = issue.articles.map((a) => a.order);
      expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    }
  });

  it("builds tags with correct counts", () => {
    for (const tag of getAllTags()) {
      expect(tag.count).toBe(tag.articles.length + tag.blogPosts.length);
      expect(tag.count).toBeGreaterThan(0);
    }
  });

  it("gives every article a reading time of at least one minute", () => {
    for (const article of getAllArticles()) {
      expect(article.readingTime).toBeGreaterThanOrEqual(1);
    }
  });

  it("builds legacy-compatible article URLs", () => {
    const article = getAllArticles()[0];
    expect(article.url).toMatch(/^\/mags\/[01]{8}\/[^/]+$/);
  });

  it("returns related articles that share a tag and exclude the article itself", () => {
    const article = getAllArticles().find((a) => a.tags.length > 0)!;
    const related = getRelatedArticles(article, 3);
    expect(related.length).toBeLessThanOrEqual(3);
    for (const r of related) expect(r.url).not.toBe(article.url);
  });

  it("returns adjacent articles within the same issue", () => {
    const issue = getAllIssues().find((i) => i.articles.length > 2)!;
    const middle = issue.articles[1];
    const { prev, next } = getAdjacentArticles(middle);
    expect(prev?.url).toBe(issue.articles[0].url);
    expect(next?.url).toBe(issue.articles[2].url);
  });

  it("returns no prev for the first article in an issue", () => {
    const issue = getAllIssues().find((i) => i.articles.length > 1)!;
    expect(getAdjacentArticles(issue.articles[0]).prev).toBeUndefined();
  });

  it("computes stats from the graph", () => {
    const stats = getStats();
    expect(stats.issues).toBe(8);
    expect(stats.articles).toBe(getAllArticles().length);
    expect(stats.authors).toBe(getAllAuthors().length);
    expect(stats.codenameh).toBe(13);
  });

  it("memoizes the graph", () => {
    expect(getGraph()).toBe(getGraph());
  });

  it("finds an author by id", () => {
    const first = getAllAuthors()[0];
    expect(getAuthor(first.id)).toBe(first);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/content/graph.test.ts`
Expected: FAIL — cannot resolve `./index`

- [ ] **Step 3: Implement lib/content/read.ts**

Filesystem layer only: `readIssueMetas()`, `readArticleFiles()`, `readBlogFiles()`, `readWorkshopFiles()`, `readPeople()`, `readCodenameh()`. Each reads from `content/`, parses with `gray-matter`, validates with the matching Zod schema, and throws an error naming the file and field on failure. Returns raw (unresolved) records.

- [ ] **Step 4: Implement lib/content/graph.ts**

Builds the graph in dependency order: authors → issues → articles (linking both directions) → blog posts → workshops → tags. Freezes the result. Memoizes in a module-level variable.

Slug rules — these must match the legacy URLs exactly:
- article: `/mags/${issueNumber}/${slug}`
- issue: `/mags/${number}`
- blog: `/blog/${slug}`
- workshop doc: `/workshops/${workshop}/${slug}`
- author: `/authors/${id}`
- tag: `/tags/${tagSlug}` where `tagSlug` is `normalizePersian(name).replace(/\s+/g, "-")` URL-encoded

- [ ] **Step 5: Implement lib/content/index.ts**

Re-export the accessor functions listed in the Interfaces block above.

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm test lib/content/graph.test.ts`
Expected: PASS (16 tests)

- [ ] **Step 7: Commit**

```bash
git add lib/content
git commit -m "feat: add build-time content graph with resolved relations"
```

---

### Task 8: MDX pipeline and content components

**Files:**
- Create: `lib/mdx/remark-admonition.ts`, `lib/mdx/options.ts`, `lib/mdx/components.tsx`, `components/content/callout.tsx`, `components/content/tooltip.tsx`, `components/content/timeline.tsx`, `components/content/author-chip.tsx`, `components/content/mermaid.tsx`, `components/content/mdx-image.tsx`, `components/mdx-content.tsx`
- Test: `lib/mdx/remark-admonition.test.ts`

**Interfaces:**
- Consumes: `cn`, content graph types
- Produces:
  - `mdxOptions` — the shared `{ remarkPlugins, rehypePlugins }` object
  - `mdxComponents` — the global component scope
  - `<MdxContent source={string} baseUrl={string} />` — async Server Component that compiles and renders MDX
  - `<Callout type title>`, `<Tooltip tip>`, `<Timeline>`, `<AuthorCallout id>`, `<Mermaid chart>`

Note: `remark-admonition` still ships even though Task 4 rewrote existing content — new authors will keep writing `:::` and it must keep working.

- [ ] **Step 1: Write the failing test for the remark plugin**

```ts
// lib/mdx/remark-admonition.test.ts
import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { remarkAdmonition } from "./remark-admonition";

async function run(input: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkAdmonition)
    .use(remarkStringify)
    .process(input);
  return String(file);
}

describe("remarkAdmonition", () => {
  it("turns a tip directive into a Callout node", async () => {
    expect(await run(":::tip\nمحتوا\n:::")).toContain("Callout");
  });

  it("preserves an admonition title", async () => {
    expect(await run(":::warning هشدار\nمحتوا\n:::")).toContain("هشدار");
  });

  it("leaves ordinary paragraphs untouched", async () => {
    expect(await run("سلام دنیا")).toContain("سلام دنیا");
  });
});
```

Add `remark-parse`, `remark-stringify`, `unified` to devDependencies.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/mdx/remark-admonition.test.ts`
Expected: FAIL — cannot resolve `./remark-admonition`

- [ ] **Step 3: Implement the plugin and options**

`remark-admonition.ts`: visit paragraph nodes whose first text child starts with `:::type`, collect until the closing `:::`, replace with an MDX JSX flow element named `Callout` carrying `type` and optional `title` attributes.

`options.ts`:

```ts
export const mdxOptions = {
  remarkPlugins: [remarkGfm, remarkMath, remarkAdmonition],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
    [rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
    }],
    rehypeKatex,
  ],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/mdx/remark-admonition.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Build the content components**

- `Callout` — 5 variants via `cva`, each with icon and color token, correct RTL icon placement.
- `Tooltip` — **must work on touch**: shadcn Tooltip on hover for pointer devices, Popover on tap for touch. This fixes a real legacy bug across 438 uses. Renders `tip` (Latin term) with `dir="ltr"`.
- `Timeline` — scroll-revealed vertical timeline, RTL-aware.
- `AuthorCallout` — resolves an author id through the graph, renders avatar + name linking to `/authors/[id]`.
- `Mermaid` — client component, dynamic-imports `mermaid`, renders on mount only.
- `MdxImage` — wraps `next/image` with `unoptimized`, resolves relative `./img/x.png` against the article's public path.

- [ ] **Step 6: Verify a real article renders**

Add a temporary route rendering one migrated article; run `pnpm build`; confirm no MDX compile errors across all articles.

- [ ] **Step 7: Commit**

```bash
git add lib/mdx components/content components/mdx-content.tsx
git commit -m "feat: add MDX pipeline and content components"
```

---

### Task 9: Design system, layout shell, and shadcn primitives

**Files:**
- Create: `app/globals.css` (replace), `app/layout.tsx` (replace), `components/layout/header.tsx`, `components/layout/footer.tsx`, `components/layout/mobile-nav.tsx`, `components/layout/theme-provider.tsx`, `components/layout/theme-toggle.tsx`, `lib/fonts.ts`
- Add shadcn primitives: `button card badge avatar sheet dialog command tooltip popover separator skeleton input tabs scroll-area dropdown-menu`

**Interfaces:**
- Consumes: `SITE`, `NAV_ITEMS` from `@/lib/site`
- Produces: `<Header />`, `<Footer />`, `<ThemeProvider />`, `<ThemeToggle />`, `fontVariables` string

- [ ] **Step 1: Install shadcn primitives**

```bash
pnpm dlx shadcn@latest add button card badge avatar sheet dialog command tooltip popover separator skeleton input tabs scroll-area dropdown-menu
```

- [ ] **Step 2: Set up fonts**

`lib/fonts.ts` using `next/font/local` over `public/fonts/Vazirmatn.woff2` and `public/fonts/Dana-Bold.woff2`, exposing `--font-sans` and `--font-display`. JetBrains Mono from `next/font/google` as `--font-mono`.

- [ ] **Step 3: Write globals.css**

Full OKLCH token set for light and dark, both complete. Issue theme colors as `--issue-accent` consumed per page. Typography defaults for RTL prose, `.prose` styles for MDX output, KaTeX overrides, code-block styling for the dual Shiki theme.

- [ ] **Step 4: Build the layout shell**

Root layout: `lang="fa" dir="rtl"`, fonts, `ThemeProvider` (class strategy, system default, no-flash inline script), `Header`, `main`, `Footer`. Header is sticky with backdrop blur, holds nav, ⌘K trigger, theme toggle, and a mobile `Sheet`.

- [ ] **Step 5: Verify**

Run: `pnpm build && pnpm typecheck`
Expected: both exit 0. Manually confirm in `pnpm dev` that light and dark both render and that no `ml-`/`mr-`/`left-`/`right-` classes were used.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add design system, fonts, and layout shell"
```

---

### Task 10: Article, issue, and archive pages

**Files:**
- Create: `app/mags/intro/page.tsx`, `app/mags/[issue]/page.tsx`, `app/mags/[issue]/[article]/page.tsx`, `components/cards/article-card.tsx`, `components/cards/issue-card.tsx`, `components/content/table-of-contents.tsx`, `components/content/article-header.tsx`, `components/content/article-footer.tsx`

**Interfaces:**
- Consumes: content graph accessors, `MdxContent`, cards
- Produces: `<ArticleCard article compact? />`, `<IssueCard issue />`, `<TableOfContents headings />`

- [ ] **Step 1: Build the article page**

`generateStaticParams` over `getAllArticles()` → `{ issue, article }`. `generateMetadata` from frontmatter with canonical URL, OG image at `/og/${issue}-${slug}.png`, and `Article` JSON-LD. Page renders: article header (title, authors, Jalali date, reading time, tags, issue badge tinted by `themeColor`), TOC sidebar on desktop, `MdxContent`, then footer with authors, related articles, and prev/next.

- [ ] **Step 2: Build the issue page**

`generateStaticParams` over `getAllIssues()`. Renders cover, description, Jalali date, article count in Persian digits, PDF download button via `pdfUrl()`, and the ordered article list.

- [ ] **Step 3: Build the archive intro page**

All 8 issues as a responsive grid of `IssueCard`, newest first, each tinted by its `themeColor`.

- [ ] **Step 4: Verify**

Run: `pnpm build`
Expected: exits 0 and emits 94 article pages plus 8 issue pages.

```bash
ls out/mags/00000101/ | head
test -f out/mags/00000101/01-quantum/index.html && echo "legacy URL preserved"
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add article, issue, and archive pages"
```

---

### Task 11: Articles index with search and filters

**Files:**
- Create: `app/articles/page.tsx`, `components/articles/article-filters.tsx`, `components/articles/article-grid.tsx`, `lib/search.ts`, `scripts/lib/search-index.ts`
- Test: `lib/search.test.ts`

**Interfaces:**
- Consumes: content graph, `normalizePersian`
- Produces:
  - `buildSearchIndex(graph): SearchDoc[]` where `SearchDoc = { url, title, description, tags, authors, kind, issue? }`
  - `searchDocs(docs: SearchDoc[], query: string, limit?: number): SearchDoc[]`
  - `<ArticleFilters />`, `<ArticleGrid />`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/search.test.ts
import { describe, it, expect } from "vitest";
import { searchDocs, type SearchDoc } from "./search";

const docs: SearchDoc[] = [
  { url: "/a", title: "رایانش کوانتومی", description: "کیوبیت", tags: ["Quantum"], authors: ["امیرمهدی"], kind: "article" },
  { url: "/b", title: "برنامه‌نویسی وب", description: "ری‌اکت", tags: ["Web"], authors: ["معین"], kind: "article" },
  { url: "/c", title: "DevOps چیست", description: "استقرار", tags: ["DevOps"], authors: ["معین"], kind: "blog" },
];

describe("searchDocs", () => {
  it("matches a Persian title", () => {
    expect(searchDocs(docs, "کوانتومی").map((d) => d.url)).toEqual(["/a"]);
  });

  it("matches regardless of Arabic vs Persian yeh", () => {
    expect(searchDocs(docs, "برنامه‌نويسی").map((d) => d.url)).toContain("/b");
  });

  it("matches ignoring ZWNJ", () => {
    expect(searchDocs(docs, "برنامه نویسی").map((d) => d.url)).toContain("/b");
  });

  it("matches a Latin tag case-insensitively", () => {
    expect(searchDocs(docs, "devops").map((d) => d.url)).toContain("/c");
  });

  it("matches an author name", () => {
    expect(searchDocs(docs, "معین").map((d) => d.url).sort()).toEqual(["/b", "/c"]);
  });

  it("ranks title matches above description matches", () => {
    const results = searchDocs(docs, "کیوبیت");
    expect(results[0].url).toBe("/a");
  });

  it("returns an empty array for an empty query", () => {
    expect(searchDocs(docs, "  ")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(searchDocs(docs, "معین", 1)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/search.test.ts`
Expected: FAIL — cannot resolve `./search`

- [ ] **Step 3: Implement lib/search.ts**

Score each doc: title match 10, tag match 6, author match 5, description match 3. Normalize both query and fields with `normalizePersian` before comparing. Sort by score desc, then title. Return at most `limit` (default 20).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/search.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Build the articles page**

Server component passes the full article list (already serialized, no bodies) to a client `ArticleGrid`. Filters by tag, author, and issue, with state in URL search params (`?tag=x&author=y&issue=z&q=`) so views are shareable. Counts next to each facet come from the graph.

- [ ] **Step 6: Emit the search index at build time**

Write `public/search-index.json` from a `postbuild`-safe path: generate it in `next.config.ts` via a build-time import, or simplest and most explicit — a `prebuild` script step that writes the file. Wire `"prebuild": "tsx scripts/build-search-index.ts"` into package.json.

- [ ] **Step 7: Verify**

Run: `pnpm build && test -f public/search-index.json && echo ok`
Expected: `ok`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add articles index with faceted filters and search"
```

---

### Task 12: Command palette search

**Files:**
- Create: `components/layout/search-dialog.tsx`, `hooks/use-search-index.ts`
- Modify: `components/layout/header.tsx`

**Interfaces:**
- Consumes: `searchDocs`, `/search-index.json`
- Produces: `<SearchDialog />` mounted in the header

- [ ] **Step 1: Build the hook**

`useSearchIndex()` fetches `/search-index.json` once, lazily, on first dialog open. Caches in module state. Returns `{ docs, loading }`.

- [ ] **Step 2: Build the dialog**

shadcn `Command` inside `Dialog`. Opens on ⌘K / Ctrl+K and on header button click. Groups results by kind (مقاله / وبلاگ / کارگاه / نویسنده). Keyboard navigable. Empty state and loading skeleton included.

- [ ] **Step 3: Verify**

Run `pnpm dev`, press ⌘K, type `کوانتوم`, confirm the quantum article appears and Enter navigates to it.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add command palette search"
```

---

### Task 13: Blog and workshops

**Files:**
- Create: `app/blog/page.tsx`, `app/blog/[...slug]/page.tsx`, `app/workshops/page.tsx`, `app/workshops/[workshop]/[...slug]/page.tsx`, `components/workshops/workshop-sidebar.tsx`

**Interfaces:**
- Consumes: `getAllBlogPosts`, `getBlogPost`, `getAllWorkshops`, `getWorkshop`, `getWorkshopDoc`, `MdxContent`
- Produces: blog and workshop routes at legacy-compatible paths

- [ ] **Step 1: Build the blog index and post pages**

Index lists posts newest first with cover, title, description, authors, Jalali date, reading time. Post page mirrors the article page layout, with `BlogPosting` JSON-LD.

- [ ] **Step 2: Build the workshops pages**

`/workshops` lists available workshops (currently just `git`). Doc pages use a persistent sidebar listing the workshop's docs in order, with prev/next navigation.

- [ ] **Step 3: Verify legacy URLs**

```bash
pnpm build
test -f out/blog/index.html && echo "blog ok"
test -d out/workshops/git && echo "workshops ok"
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add blog and workshop pages"
```

---

### Task 14: People and codenameh pages

**Files:**
- Create: `app/authors/page.tsx`, `app/authors/[id]/page.tsx`, `app/staff/page.tsx`, `app/codenameh/page.tsx`, `app/tags/[tag]/page.tsx`, `components/cards/author-card.tsx`, `components/cards/staff-card.tsx`, `components/cards/codenameh-card.tsx`

**Interfaces:**
- Consumes: `getAllAuthors`, `getAuthor`, `getStaffSections`, `getCodenameh`, `getAllTags`, `getTag`
- Produces: the people, tag, and codenameh routes

- [ ] **Step 1: Build the authors index**

Grid of all authors sorted by article count desc, each card showing avatar, name, title, socials, and **article count computed at build time** (`author.articleCount`, rendered in Persian digits).

- [ ] **Step 2: Build the author detail page**

`generateStaticParams` over all authors. Shows profile, socials, stats, and their articles and blog posts. `Person` JSON-LD.

- [ ] **Step 3: Build the staff page**

Sections in source order; each member card links to `/authors/[id]` when `authorId` is set.

- [ ] **Step 4: Build the codenameh page**

Groups by `era`, each entry a cover card linking to its PDF on the CDN. Since codenameh is PDF-only, cards link out directly with an external-link affordance.

- [ ] **Step 5: Build tag pages**

`generateStaticParams` over all tags. Lists that tag's articles and blog posts.

- [ ] **Step 6: Verify**

```bash
pnpm build
ls out/authors | wc -l   # ~70 directories + index
test -f out/codenameh/index.html && echo ok
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add authors, staff, tags, and codenameh pages"
```

---

### Task 15: Landing page

**Files:**
- Create: `app/page.tsx` (replace), `components/sections/hero.tsx`, `components/sections/latest-issue.tsx`, `components/sections/featured-articles.tsx`, `components/sections/stats.tsx`, `components/sections/workshops-teaser.tsx`, `components/sections/staff-marquee.tsx`, `components/motion/*`

**Interfaces:**
- Consumes: `getStats`, `getAllIssues`, `getAllArticles`, `getAllWorkshops`, `getStaffSections`
- Produces: the landing page

- [ ] **Step 1: Add React Bits components**

```bash
pnpm dlx shadcn@latest add @react-bits/decrypted-text @react-bits/count-up @react-bits/spotlight-card @react-bits/shiny-text
```

If a component is unavailable from the registry, implement the equivalent locally with `motion` — do not leave the section unbuilt.

- [ ] **Step 2: Build the reduced-motion guard**

`components/motion/motion-safe.tsx` — a hook + wrapper that reads `prefers-reduced-motion` and renders the static fallback when set. Every animated section uses it.

- [ ] **Step 3: Build the hero**

Large Persian display type on `--font-display`. The binary issue number (`00001000`) gets a decrypt/glitch animation — motion derived from Byte's binary identity, not generic particles. Primary CTA to the latest issue, secondary to `/articles`.

- [ ] **Step 4: Build the remaining sections**

- Latest issue: 3D-tilt cover, description, read + PDF actions.
- Featured articles: 6 recent articles as spotlight cards tinted by issue color.
- Stats: animated counters in Persian digits from `getStats()` — ۹۴ مقاله / ۷۰ نویسنده / ۸ شماره / ۱۳ کدنامه.
- Workshops teaser and staff marquee, then footer.

All heavy/canvas effects use `next/dynamic` with `ssr: false` and an `IntersectionObserver` so they never block first paint or animate offscreen.

- [ ] **Step 5: Verify**

Run: `pnpm build && pnpm typecheck`
Expected: both exit 0. Confirm in the browser that the landing renders in both themes and that enabling "reduce motion" in OS settings stops the animations.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add landing page"
```

---

### Task 16: SEO, OG images, sitemap, and 404

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/manifest.ts`, `scripts/generate-og.ts`, `lib/seo.ts`
- Test: `lib/seo.test.ts`

**Interfaces:**
- Consumes: content graph, `SITE`
- Produces:
  - `buildMetadata(input): Metadata`
  - `articleJsonLd(article)`, `personJsonLd(author)`, `issueJsonLd(issue)`, `breadcrumbJsonLd(items)`

- [ ] **Step 1: Write the failing tests**

```ts
// lib/seo.test.ts
import { describe, it, expect } from "vitest";
import { buildMetadata, articleJsonLd } from "./seo";
import { SITE } from "./site";

describe("buildMetadata", () => {
  it("appends the site name to the title", () => {
    const meta = buildMetadata({ title: "مقاله", description: "توضیح", path: "/x" });
    expect(String(meta.title)).toContain("مقاله");
    expect(String(meta.title)).toContain(SITE.shortName);
  });

  it("sets an absolute canonical URL", () => {
    const meta = buildMetadata({ title: "t", description: "d", path: "/mags/00000101" });
    expect(meta.alternates?.canonical).toBe(`${SITE.url}/mags/00000101`);
  });

  it("sets openGraph locale to fa_IR", () => {
    const meta = buildMetadata({ title: "t", description: "d", path: "/" });
    expect(meta.openGraph?.locale).toBe("fa_IR");
  });
});

describe("articleJsonLd", () => {
  it("emits a valid Article node with ISO dates and authors", () => {
    const ld = articleJsonLd({
      title: "مقاله",
      description: "توضیح",
      url: "/mags/00000101/x",
      date: "2025-09-22",
      authors: [{ name: "معین", url: "/authors/Moeein" }],
    });
    expect(ld["@type"]).toBe("Article");
    expect(ld.datePublished).toBe("2025-09-22");
    expect(ld.author[0].name).toBe("معین");
    expect(ld.mainEntityOfPage).toContain(SITE.url);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/seo.test.ts`
Expected: FAIL — cannot resolve `./seo`

- [ ] **Step 3: Implement lib/seo.ts, then run the tests**

Run: `pnpm test lib/seo.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 4: Build sitemap, robots, manifest, and 404**

`sitemap.ts` enumerates every URL from the graph with `lastModified` from dates. `robots.ts` allows all and points at the sitemap. `not-found.tsx` is a designed Persian 404 with links back into the archive.

- [ ] **Step 5: Build OG image generation**

`scripts/generate-og.ts` uses Satori + `resvg` with Vazirmatn to render one PNG per article, issue, blog post, and author into `public/og/`. Wire into `prebuild`. Include a default `public/og/default.png`.

- [ ] **Step 6: Verify**

```bash
pnpm build
test -f out/sitemap.xml && echo "sitemap ok"
test -f out/robots.txt && echo "robots ok"
ls public/og | wc -l   # >= 100
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add SEO metadata, JSON-LD, sitemap, and OG images"
```

---

### Task 17: Final verification and documentation

**Files:**
- Create: `README.md`, `.github/workflows/deploy.yml`, `.env.example`
- Test: `scripts/verify-urls.ts`

**Interfaces:**
- Consumes: the exported `out/` directory
- Produces: a URL verification script and deployment config

- [ ] **Step 1: Write the legacy-URL verification script**

`scripts/verify-urls.ts` reads the legacy repo, derives every URL the old site published, and asserts a corresponding `out/**/index.html` exists. Exits non-zero listing any missing URL.

- [ ] **Step 2: Run the full verification suite**

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm tsx scripts/verify-urls.ts
```

All five must exit 0. Fix anything that does not.

- [ ] **Step 3: Write the README**

Document: what the site is, the stack, `content/` authoring format (frontmatter fields, available MDX components, `:::` admonitions), how to add an issue/article/author, all scripts, the `NEXT_PUBLIC_PDF_BASE_URL` env var, and deployment.

- [ ] **Step 4: Add the deploy workflow**

GitHub Actions: pnpm install, typecheck, test, build, upload `out/` as a Pages artifact, deploy.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README, deploy workflow, and URL verification"
```

---

## Self-Review

**Spec coverage:** Stack → Task 1. Persian utilities → Task 2. Schemas/site config → Task 3. Migration (transforms, people, runner, tag normalization, report) → Tasks 4-6. Content graph with build-time counts and inverse relations → Task 7. MDX pipeline and rebuilt components (Tooltip touch fix, Callout, Timeline, AuthorCallout, math, mermaid) → Task 8. Design system, fonts, RTL, themes → Task 9. Preserved routes → Tasks 10, 13, 14. New routes (`/articles`, `/authors/[id]`, `/tags/[tag]`) → Tasks 11, 14. Search (index + fuzzy + facets) → Tasks 11, 12. Landing → Task 15. SEO, JSON-LD, sitemap, OG → Task 16. Testing and URL verification → Task 17. No gaps.

**Placeholders:** none. Every code step carries real code; prose steps that describe UI construction name the exact files, props, and behaviors.

**Type consistency:** `Article`, `Author`, `Issue`, `BlogPost`, `WorkshopDoc`, `Workshop`, `Tag`, `ContentGraph` defined once in Task 3 and used unchanged thereafter. Accessor names in Task 7's Interfaces block match their call sites in Tasks 10-16. `SearchDoc` defined in Task 11 and consumed in Task 12. `pdfUrl()` defined in Task 3, used in Tasks 10 and 14. `normalizePersian` defined in Task 2, used in Tasks 4, 5, 7, 11.
