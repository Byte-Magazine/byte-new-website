# Byte New Website — Design Spec

**Date:** 2026-09-10
**Repo:** `byte-new-website`
**Replaces:** `byte-site` (Docusaurus 3.9)

## Purpose

Rebuild the Byte publication website (نشریه‌ی علمی فرهنگی بایت, Sharif University
CE faculty) as a modern, statically-exported Next.js application. The new site
must preserve every existing URL, migrate all existing content, and compute all
derived data at build time.

## Constraints

- **Fully static.** `next build` with `output: "export"` produces a directory of
  files servable from any static host. No server runtime, no API routes, no ISR.
- **All data resolved at build time.** Counts, relations, and search indexes are
  computed during the build, never fetched or derived in the browser.
- **Persian-first, RTL.** Article titles, author names, and prose are Persian.
  The UI may mix Persian and English. Document direction is RTL.
- **Legacy URLs preserved exactly.** Existing inbound links and search rankings
  must not break.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` |
| UI | React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn v4 — style `base-lyra`, base color zinc, `rtl: true` |
| Motion | `motion` v13 + React Bits (`@react-bits` registry) |
| Content | MDX via `next-mdx-remote-client`, `gray-matter`, Zod validation |
| Code highlighting | `rehype-pretty-code` + Shiki (dual light/dark theme) |
| Math | `remark-math` + `rehype-katex` |
| Testing | Vitest |
| Package manager | pnpm 10.18.2 |

Mirrors the stack of `/Users/moeein/Documents/MoeeinAali/me-frontend`.

## Decisions

These were settled during brainstorming and are not open questions:

1. **URLs:** keep legacy paths exactly. New sections are additive only.
2. **Articles model:** one corpus, two views. `/articles` is a flat filterable
   index; `/mags/*` is the issue-centric archive. Both read the same MDX files.
3. **MDX:** rebuild all Docusaurus-specific components as better native ones,
   AND mechanically rewrite content files (imports, admonitions, frontmatter).
   Persian prose is never edited.
4. **Frontmatter:** restructured — add `date`, `issue`, `order`, `cover`,
   normalized `tags`.
5. **Dates:** each article inherits its issue's publish date. Order within an
   issue comes from the `NN-` filename prefix.
6. **Calendar:** store ISO dates in frontmatter; render Jalali in the UI via
   `Intl.DateTimeFormat` with the `persian` calendar. No date library.
7. **PDFs:** external CDN at
   `https://byte-mag.s3.ir-thr-at1.arvanstorage.ir/mags/<number>.pdf`,
   configurable via `NEXT_PUBLIC_PDF_BASE_URL`.
8. **Theme:** light and dark, both fully designed, following system by default.
9. **Search:** both a build-time index with client-side fuzzy search (⌘K) and
   faceted filters by tag/author/issue.
10. **Landing:** editorial-tech hybrid direction.

## Source Inventory

Measured from `byte-site/`:

| Content | Count | Location |
|---|---|---|
| Mag issues | 8 | `mags/000000{01..1000}/` |
| Mag articles | 95 | `mags/<issue>/<NN-slug>/index.mdx` |
| Articles with images | 53 | co-located `img/` folders |
| Blog posts | 2 | `blog/2025/<MM-DD-slug>/index.mdx` |
| Workshop docs | 6 | `workshops/git/` |
| Authors | 70 | `mags/authors.json`, `blog/authors.yml` |
| Staff | 23 | `src/data/STAFF_SECTION_LIST.ts` |
| Codenameh issues | 13 | `src/data/FEATURE_LIST.ts` |

Docusaurus-specific syntax in content: `<Tooltip>` (438 uses),
`<AuthorCallout>` (11), `<Timeline>` (1), `:::` admonitions (52 across
danger/info/note/tip/warning), KaTeX math (7 files), mermaid (2 files).

## Architecture

### Content directory

Migrated content lives in `content/`, git-tracked, the single source of truth:

```
content/
  issues/
    00000101/
      meta.json                    # title, date (ISO), cover, themeColor, description
      01-quantum/
        index.mdx
        img/1.png
  blog/2025/11-20-bugsbuzzy/index.mdx
  workshops/git/01-start-git.mdx
  people/authors.json              # 70 authors, unified
  people/staff.json                # sections -> member ids
  codenameh.json                   # 13 entries
```

### Content graph (`lib/content/`)

A single module builds a fully-resolved, frozen graph once per build,
memoized at module level. Every page reads from it.

Responsibilities:

- Read all MDX with `gray-matter`; validate frontmatter with Zod. Invalid
  frontmatter fails the build with a message naming the file and field.
- Resolve author ids to author objects, and build the inverse relation so
  `author.articles` is a populated array. **This is how per-author counts are
  computed at build time.**
- Derive: reading time (Persian-aware word count), tag→articles, issue→articles
  (ordered by `order`), prev/next within an issue, related articles by shared
  tags.
- Emit `public/search-index.json` for the client-side search.

Rationale for one graph module rather than per-page loaders: the required counts
are inverse relations. Computing them per-page means re-scanning content N times
and risks inconsistency. Building the graph once makes them property lookups and
keeps the logic testable in isolation.

### MDX pipeline

Compiled at build time inside Server Components. Shared plugin chain:

- remark: `remark-gfm`, `remark-math`, custom `remark-admonition`
- rehype: `rehype-katex`, `rehype-slug`, `rehype-autolink-headings`,
  `rehype-pretty-code`

All custom components are provided globally to the MDX scope, so content files
contain no imports. Mermaid renders client-side, lazily, only where used.

## Routes

### Preserved

| Route | Source |
|---|---|
| `/mags/intro` | migrated `mags/intro.mdx` |
| `/mags/[issue]` | `content/issues/*/meta.json` |
| `/mags/[issue]/[article]` | 95 MDX files |
| `/blog` | blog index |
| `/blog/[...slug]` | blog posts |
| `/workshops/[workshop]/[...slug]` | workshop docs |
| `/staff` | `people/staff.json` |
| `/authors` | `people/authors.json` |
| `/codenameh` | `codenameh.json` |

### New

| Route | Purpose |
|---|---|
| `/` | landing |
| `/articles` | flat filterable index of all articles |
| `/authors/[id]` | per-author page with their articles |
| `/tags/[tag]` | per-tag archive |

### Static export mechanics

- `generateStaticParams` on every dynamic segment; `dynamicParams = false`.
- `images.unoptimized: true`.
- `trailingSlash: true` (matches Docusaurus output shape).
- `app/sitemap.ts` and `app/robots.ts` generate from the content graph.
- Root `not-found.tsx`.

### SEO

`generateMetadata` per page from frontmatter: title, description, canonical,
OG and Twitter cards. JSON-LD: `Article` for articles (author, datePublished,
`isPartOf` the issue), `Person` for authors, `PublicationIssue` for issues.

OG images are generated at build time into `public/og/` by a script using Satori
with the Vazirmatn font, because static export cannot run dynamic
`opengraph-image` routes.

## Migration

`scripts/migrate.ts` — standalone, idempotent, re-runnable. Reads the legacy
repo, writes `content/`. Never modifies the legacy repo. Deleting `content/` and
re-running produces an identical result.

The legacy repo path defaults to `../byte-site` (its location relative to this
repo today) and is overridable via the `BYTE_LEGACY_PATH` environment variable.
The script is a one-time-use tool retained in the repo for reproducibility; it
is not part of the build. After migration, `content/` is the source of truth and
the build never reads the legacy repo.

### Per-file transform

1. Parse frontmatter and body with gray-matter.
2. Strip all `@site/...` imports.
3. Convert `:::type [title]` admonitions to `<Callout type="type" title="...">`,
   parsing block structure rather than matching regex line-by-line, so fenced
   code containing `:::` is not corrupted. Handles nesting.
4. Restructure frontmatter to the Zod schema:
   ```yaml
   title: string
   description: string
   authors: [author-id]
   tags: [normalized-tag]
   date: 2025-09-22        # inherited from issue
   issue: "00000101"
   order: 1                # from NN- filename prefix
   cover: ./img/1.png      # first co-located image, if present
   ```
5. Copy co-located `img/` folders; rewrite image references.
6. Merge `mags/authors.json`, `blog/authors.yml`, and `STAFF_SECTION_LIST.ts`
   into `people/authors.json` keyed by id, with a `staff` flag and section
   membership, deduplicating people appearing in multiple sources.

### Tag normalization

Merges case, spacing, and Arabic-vs-Persian character variants (ی/ي, ک/ك). The
generated mapping table is **presented for approval before it is applied** —
this is the only step operating on Persian text where a wrong guess is not
mechanically detectable.

### Safety

- Emits `migration-report.md`: files processed, unknown JSX tags, unresolved
  author ids, broken image references, tag merges applied. Anything unhandled is
  reported, never silently dropped.
- Vitest suite covers the transforms: admonition edge cases, frontmatter
  inference, author resolution, image path rewriting.

## Components

### Rebuilt from Docusaurus

| Legacy | New | Improvement |
|---|---|---|
| `Tooltip` | shadcn Tooltip + Popover | works on touch; legacy is hover-only, a real bug across 438 uses |
| `:::` admonitions | `<Callout>` | 5 typed variants, themed for light and dark |
| `AuthorCallout` | author chip | avatar, links to `/authors/[id]` |
| `Timeline` | animated timeline | scroll-reveal |

### Design system

- **Typography:** Vazirmatn (variable) for body and UI; Dana Bold for display
  headings — both self-hosted from legacy `static/fonts/` via `next/font/local`
  with `font-display: swap`. JetBrains Mono for code, Latin-only so Persian
  never falls into it.
- **RTL:** `dir="rtl"` document default with `dir="ltr"` islands for code and
  Latin terms. All spacing uses logical properties (`ms-`/`me-`, `ps-`/`pe-`).
- **Color:** the 8 issue `themeColor` values become design tokens; issue and
  article pages tint their accent from their own issue color. Neutral base zinc.
  Light and dark fully specified via OKLCH CSS variables.
- **Motion:** React Bits used deliberately — hero display type, stat counters,
  issue-cover showcase, scroll reveals. All respect `prefers-reduced-motion`.
  Canvas-heavy effects are `next/dynamic` + `IntersectionObserver` so they never
  block first paint or run offscreen.

## Landing page

Editorial-tech hybrid, in scroll order:

1. **Hero** — large Persian display type; binary issue numbers (`00001000`) with
   an animated glitch/decrypt treatment. The motion derives from Byte's binary
   identity rather than generic particle effects.
2. **Latest issue** — 3D-tilt cover, description, read and PDF-download actions.
3. **Featured articles** — spotlight cards tinted by issue color.
4. **Stats** — animated counters from the content graph: ۹۵ مقاله / ۷۰ نویسنده /
   ۸ شماره / ۱۳ کدنامه.
5. **Workshops** teaser.
6. **Staff** marquee.
7. Footer.

## Search

- Build-time `public/search-index.json`: title, description, tags, author names,
  headings, URL.
- ⌘K command palette with client-side fuzzy matching, Persian-normalized
  (folds ی/ي, ک/ك, strips diacritics and ZWNJ so queries match regardless of
  input variant).
- `/articles` faceted filters by tag, author, and issue, with state synced to
  URL search params so filtered views are shareable.

## Testing

Vitest covers the pure logic, which is where correctness actually lives:

- Migration transforms (admonition parsing, frontmatter inference, author
  resolution, image rewriting).
- Content graph derivations (counts, inverse relations, ordering, related
  articles).
- Persian text utilities (search normalization, Jalali formatting, digit
  conversion, reading time).

Build-level verification: `next build` must exit clean, and a link-check over
the exported HTML must confirm every legacy URL resolves.

## Out of Scope

- Comments (legacy had a `Comment.js` component; not carried over).
- Any authenticated or write functionality.
- Content management UI. Authoring stays git + MDX.
- Additional locales. Persian only, as today.
