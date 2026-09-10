# نشریه‌ی علمی فرهنگی بایت — وب‌سایت

Website of Byte, the scientific and cultural magazine of the Computer
Engineering department at Sharif University of Technology.

A statically-exported Next.js application. It replaces the previous Docusaurus
site, preserving every published URL.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 |
| Type | Pinar (Persian, variable) + JetBrains Mono, self-hosted |
| Components | shadcn v4 (`base-lyra`, zinc, RTL) |
| Motion | `motion` v13 + React Bits |
| Content | MDX, `gray-matter`, Zod validation |
| State | zustand (persisted) |
| Highlighting | Shiki via `rehype-pretty-code` (dual theme) |
| Math | KaTeX |
| Testing | Vitest |
| Package manager | pnpm 10 |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

To produce the static site:

```bash
pnpm build        # writes ./out
```

`pnpm build` runs `prebuild` first, which syncs content assets into `public/`,
writes the search index, and renders Open Graph images.

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | development server |
| `pnpm build` | static export to `out/` |
| `pnpm test` | Vitest suite |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm sync:assets` | copy co-located content images into `public/` |
| `pnpm generate:og` | regenerate Open Graph images |

### Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_PDF_BASE_URL` | `https://byte-mag.s3.ir-thr-at1.arvanstorage.ir` | Base URL for issue and codenameh PDFs |

Issue PDFs are expected at `<base>/mags/<issue>.pdf`, codenameh at
`<base>/codenameh/<id>.pdf`.

## Architecture

Everything derived — article counts per author, per tag, and per issue, the
search index, reading times, related articles — is computed **once at build
time**. Nothing is derived in the browser or at request time.

```
content/            MDX and typed data; the source of truth
content/data/       authors, staff, codenameh, workshops as TypeScript
lib/content/        schema, filesystem reader, and the resolved content graph
lib/mdx/            remark/rehype pipeline and the global MDX component scope
components/         ui (shadcn), content, cards, layout, sections, motion
app/                routes
scripts/            asset sync, search index, OG images
assets/fonts/       static Pinar instances used only to render OG images
```

### The content graph

`lib/content/graph.ts` reads `content/` once per process and returns a frozen
object graph in which the inverse relations are already populated:
`author.articles`, `issue.articles`, `tag.articles`. Counting an author's
articles is therefore a property read, not a scan.

Frontmatter is validated with Zod. An invalid field fails the build with a
message naming the file, rather than rendering something wrong.

## Authoring

Content lives in `content/`, and every document is an `index.mdx` beside its
own assets.

```
content/issues/00001000/my-article/
  index.mdx
  img/diagram.png
```

### Frontmatter

Articles (`content/issues/<issue>/<slug>/index.mdx`):

```yaml
---
title: عنوان مقاله
description: خلاصهٔ یک‌خطی
authors: [AuthorId]
tags: [برچسب, Tag]
date: "2025-09-22"     # ISO; rendered as Jalali in the UI
issue: "00000101"
order: 1               # position within the issue
cover: ./img/1.png     # optional
---
```

Blog posts take the same fields without `issue` and `order`. Workshop docs take
`title`, `description`, `order`, and `workshop`.

Dates are stored ISO and rendered as Jalali via `Intl`, so sorting, sitemaps,
and structured data all work while readers see `۱۴۰۴/۰۶/۳۱`.

### Components available in MDX

No imports are needed; these are provided globally.

```mdx
<Tooltip tip="Quantum Computing">رایانش کوانتومی</Tooltip>

<Callout type="tip" title="نکته">متن</Callout>

:::warning هشدار
شکل کوتاه، همچنان پشتیبانی می‌شود.
:::

<AuthorCallout authors={["Moeein"]} />

<Timeline>
  <TimelineItem title="عنوان" date="۱۴۰۴">توضیح</TimelineItem>
</Timeline>
```

Callout types: `note`, `info`, `tip`, `warning`, `danger`. Math uses `$…$` and
`$$…$$`. Mermaid diagrams use a ```` ```mermaid ```` fence and load lazily.

### Adding an issue

1. Create `content/issues/<binary>/meta.json` with `number`, `title`,
   `description`, `date` (ISO), `cover`, and `themeColor`.
2. Add the cover to `public/img/`.
3. Add article directories under it.
4. Upload the PDF to the CDN as `mags/<binary>.pdf`.

The issue's `themeColor` becomes the accent for its own pages.

### Adding an author

Add an entry to `content/data/authors.ts`:

```ts
{
  id: "AuthorId",
  name: "نام نویسنده",
  title: "کارشناسی ۱۴۰۲",
  image: "/img/authors/AuthorId.png",
  socials: { github: "https://github.com/handle" },
}
```

Reference the `id` from article frontmatter. Their page, article list, and
counts are generated automatically.

## Content

Structured data — authors, staff, codenameh, workshops — lives in typed
TypeScript modules under `content/data/`, so a typo is a compile error rather
than a runtime surprise. Articles, blog posts, and workshop lessons are MDX
under `content/`.

The site was imported from a Docusaurus codebase; those one-time migration
scripts have been removed now that `content/` is the source of truth.

## RTL

The document is `lang="fa" dir="rtl"`. All spacing uses logical properties
(`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`), never `ml-`/`mr-`/`left-`/
`right-`. Code blocks and Latin technical terms are isolated with `dir="ltr"`.

Persian text matching folds Arabic/Persian yeh and kaf, ZWNJ, diacritics, and
digit sets — see `lib/persian.ts` — so search works regardless of how a query
is typed.

## Deployment

`pnpm build` produces `out/`, which any static host can serve. The included
GitHub Actions workflow publishes it to GitHub Pages on push to `main`.

Set `NEXT_PUBLIC_PDF_BASE_URL` in the build environment if the PDFs move.

## License

Content © Byte magazine. See the repository for details.
