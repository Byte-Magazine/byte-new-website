# Byte

The website for **Byte** (نشریه‌ی علمی فرهنگی بایت) — the scientific and cultural
magazine of the Computer Engineering department at Sharif University of
Technology.

This is a **statically exported** Next.js app. It replaces the previous
Docusaurus site while preserving every published URL. There is no server
runtime: the build produces a directory of HTML/CSS/JS that any static host can
serve.

Live site: [byte-mag.ir](https://byte-mag.ir)

---

## Principles

These constraints drive the architecture. Do not fight them.

| Constraint                        | Implication                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Fully static (`output: "export"`) | No API routes, no ISR, no request-time data fetching                                                           |
| Build-time content graph          | Counts, relations, search index, and OG images are computed in `prebuild` / module init — never in the browser |
| Persian-first, RTL                | `lang="fa" dir="rtl"`; use logical CSS (`ms`/`me`/`ps`/`pe`); isolate Latin/code with `dir="ltr"`              |
| Legacy URLs stay exact            | New routes are additive only; inbound links must not break                                                     |

---

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript (strict)
- **Tailwind CSS v4** + shadcn (`base-lyra`, RTL)
- **MDX** via `next-mdx-remote-client`, frontmatter via `gray-matter` + **Zod**
- **Shiki** (`rehype-pretty-code`) for code, **KaTeX** for math, **Mermaid** (lazy)
- **Vitest** for pure logic; **pnpm** as the package manager

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm build        # runs prebuild, then writes ./out
```

`prebuild` syncs co-located content assets into `public/`, builds the client
search index, and regenerates Open Graph images.

### Scripts

| Script                | What it does                         |
| --------------------- | ------------------------------------ |
| `pnpm dev`            | Dev server                           |
| `pnpm build`          | Static export → `out/`               |
| `pnpm test`           | Vitest                               |
| `pnpm typecheck`      | `tsc --noEmit`                       |
| `pnpm lint`           | ESLint                               |
| `pnpm prettier`       | Format the repo (`*.mdx` is ignored) |
| `pnpm prettier:check` | Prettier check only                  |
| `pnpm sync:assets`    | Copy content images into `public/`   |
| `pnpm generate:og`    | Regenerate OG images                 |

### Environment

| Variable                   | Default                                          | Purpose                                                                                     |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_PDF_BASE_URL` | `https://byte-mag.s3.ir-thr-at1.arvanstorage.ir` | CDN base for issue / codenameh PDFs                                                         |
| `NEXT_PUBLIC_BASE_PATH`    | _(empty)_                                        | Only if the site is hosted under a subpath (not needed for `byte-mag.ir` / org `github.io`) |

Expected layout on the CDN:

- Issues: `<base>/mags/<issue>.pdf`
- Codenameh: `<base>/codenameh/<id>.pdf`

---

## Repository map

```
app/                 Routes (App Router)
components/          UI, layout, cards, landing sections, motion, MDX widgets
content/             Source of truth — MDX + typed data
content/data/        authors, staff, codenameh, workshops (TypeScript modules)
lib/content/         Zod schemas, filesystem reader, resolved content graph
lib/mdx/             Remark/rehype pipeline + global MDX component map
lib/persian.ts       Digits, Jalali formatting, search normalization
scripts/             Asset sync, search index, OG generation
public/              Static assets (synced images, search index, OG, fonts)
```

---

## Content graph

`lib/content/graph.ts` loads `content/` **once per process** and returns a
frozen object graph with inverse relations already filled in:

- `author.articles` / `author.articleCount`
- `issue.articles` (ordered)
- `tag.articles` / `tag.count`
- related articles, prev/next within an issue

Invalid frontmatter **fails the build** with the file and field named. Prefer
fixing the graph over re-deriving counts in UI code.

Author credits come from frontmatter `authors` **and** `<AuthorCallout>` tags
in the MDX body (some multi-voice pieces leave frontmatter empty). Placeholder
avatars (`/img/authors/noone.svg`) and blank titles are normalized away so
grids sort by real profile signal: article count → real photo → entry year.

---

## Authoring

Every document is an `index.mdx` next to its assets:

```
content/issues/00001000/my-article/
  index.mdx
  img/diagram.png
```

### Article frontmatter

```yaml
---
title: عنوان مقاله
description: One-line summary
authors: [AuthorId]
tags: [برچسب]
date: "2025-09-22" # ISO; UI renders Jalali
issue: "00000101"
order: 1 # position within the issue
cover: ./img/1.png # optional
---
```

Blog posts omit `issue` / `order`. Workshop docs use `title`, `description`,
`order`, and `workshop`.

Dates stay ISO in source (sitemaps, sorting, JSON-LD). Readers see Jalali via
`Intl.DateTimeFormat` with the `persian` calendar — no date library.

### MDX components (global — no imports)

```mdx
<Tooltip tip="Quantum Computing">رایانش کوانتومی</Tooltip>

<Callout type="tip" title="نکته">
  …
</Callout>

:::warning هشدار
Short admonition form is still supported.
:::

<AuthorCallout author="AuthorId">…</AuthorCallout>

<Timeline>
  <TimelineItem title="…" date="۱۴۰۴">
    …
  </TimelineItem>
</Timeline>
```

Callout types: `note`, `info`, `tip`, `warning`, `danger`.  
Math: `$…$` / `$$…$$`. Mermaid: fenced ` ```mermaid ` blocks (lazy-loaded).

### New issue checklist

1. Add `content/issues/<binary>/meta.json` (`number`, `title`, `description`,
   ISO `date`, `cover`, `themeColor`).
2. Put the cover under `public/img/` (or sync path used by the issue).
3. Add article folders under the issue.
4. Upload the PDF to the CDN as `mags/<binary>.pdf`.

`themeColor` becomes the accent on that issue’s pages.

### New author checklist

Append to `content/data/authors.ts`:

```ts
{
  id: "AuthorId",
  name: "نام نویسنده",
  title: "کارشناسی ۱۴۰۲",          // entry / class year when known
  image: "/img/authors/AuthorId.png", // real headshot only — not noone.svg
  socials: { github: "https://github.com/…" },
}
```

Reference `id` from frontmatter (or `AuthorCallout`). The author page, lists,
and counts are generated from the graph.

---

## RTL & Persian search

- Prefer logical Tailwind utilities; avoid physical `ml` / `mr` / `left` /
  `right` unless the property is truly physical (e.g. cover docked to the
  visual left edge).
- Search normalization in `lib/persian.ts` folds Arabic/Persian yeh & kaf,
  ZWNJ, diacritics, and digit sets so queries match regardless of input variant.

---

## Theme

Dark is the **default**. Visitors can switch to light (or system) via the
header toggle; the choice is persisted. A blocking head script applies the
stored theme before first paint to avoid a flash.

---

## Deployment

```bash
pnpm build   # → out/
```

On every push to `main`, GitHub Actions builds the site and force-pushes `out/`
to [`Byte-Magazine/Byte-Magazine.github.io`](https://github.com/Byte-Magazine/Byte-Magazine.github.io)
`main`. That repository is the org Pages site (`byte-magazine.github.io` /
[byte-mag.ir](https://byte-mag.ir)) and deploys automatically from `main`.

Required secret on **this** repo (`byte-new-website`):

| Secret           | Purpose                                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| `GH_PAGES_TOKEN` | Fine-grained or classic PAT with **Contents: Read and write** on `Byte-Magazine/Byte-Magazine.github.io` |

Do **not** set `NEXT_PUBLIC_BASE_PATH` for this deploy — the site is served at the
domain root. Keep `public/CNAME` (`byte-mag.ir`) so GitHub Pages does not drop
the custom domain on each publish.

Override `NEXT_PUBLIC_PDF_BASE_URL` (repo variable) if the PDF CDN moves.

### Telegram Instant View

Link previews alone are not enough — Instant View needs a domain template on
[instantview.telegram.org](https://instantview.telegram.org/). Article, blog,
and workshop pages expose stable `data-iv` markers. Paste the rules from
[`docs/telegram-instant-view.md`](./docs/telegram-instant-view.md) into the
editor for `byte-mag.ir`, track ~15 URLs, then submit for Telegram review.
Until approval, only the personal `t.me/iv?url=…&rhash=…` test link works.

---

## License

Magazine content © Byte / Sharif CE. See the repository for details.
