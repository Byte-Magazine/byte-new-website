# Telegram Instant View — byte-mag.ir

## Setup

1. Open https://instantview.telegram.org/
2. Load an article URL (e.g. `https://byte-mag.ir/mags/00000010/timebased-otp/`)
3. Domain level: **byte-mag.ir**
4. Paste **only** the rules block below into **Rules** (middle panel)
5. Click **Save** (Cmd/Ctrl+S) — Preview on the right should fill in
6. **Track Changes** on ~10–15 article / blog / workshop URLs
7. **VIEW IN TELEGRAM** to test; later submit for public approval

Until Telegram approves the template, Instant View only works via your personal
`t.me/iv?url=…&rhash=…` link — not for everyone who shares the page.

Pages expose `data-iv` markers: `article`, `kicker`, `cover`, `subtitle` (lead),
`author`, `date`, `body`, `related`, `ignore`.

---

## Rules (paste into the editor)

```
~version: "2.1"

?path: /mags/[01]{8}/.+|/blog/.+|/workshops/[^/]+/.+

site_name: "بایت"
channel: "@byte_mag"

@remove: //nav
@remove: //aside[not(@data-iv="related")]
@remove: //footer
@remove: //script
@remove: //style
@remove: //*[@data-iv="ignore"]

title: //*[@data-iv="article"]//h1
kicker: //*[@data-iv="kicker"]

author: //*[@data-iv="author"]
author_url: //*[@data-iv="author"]/@href
published_date: //*[@data-iv="date"]/@datetime

body: //*[@data-iv="body"]

# Lead as a normal first paragraph — do NOT use `subtitle` (IV draws it huge).
@prepend_to($body): //*[@data-iv="subtitle"]

@wrap(<figure>): //*[@data-iv="cover"]
cover: $@

# Fallback if a page has no cover marker yet.
?not_exists: $cover
@clone: (//meta[@property="og:image"])[1]
@set_attr(src, @content): $@
@replace_tag(<img>): $@
@wrap(<figure>): $@
cover: $@
?true

image_url: //meta[@property="og:image"]/@content
description: //meta[@property="og:description"]/@content

# RelatedArticles block (only URLs that also have IV show up).
@append_to($body): //*[@data-iv="related"]

@set_attr(dir, "rtl"): $body
```

### What each piece does

| Field / rule                | Source                                  | Effect                                        |
| --------------------------- | --------------------------------------- | --------------------------------------------- |
| `kicker`                    | issue number / «وبلاگ» / workshop title | small label above title                       |
| `cover`                     | OG image via `data-iv="cover"`          | hero image at top of IV                       |
| lead → `$body`              | `data-iv="subtitle"`                    | intro as normal paragraph (not huge subtitle) |
| `related`                   | `aside[data-iv=related]`                | RelatedArticles links                         |
| `channel`                   | `@byte_mag`                             | channel join affordance                       |
| `dir="rtl"`                 | set on `$body`                          | Persian RTL layout                            |
| `image_url` / `description` | OG meta                                 | small link-preview card only                  |
| `@remove`                   | nav / chrome / `data-iv="ignore"`       | strip site chrome                             |

Tables, lists, blockquotes, `<pre>`, images, and `<details>` inside `.prose`
come through with `body` automatically.

Full reference: [Instant View Manual 2.1](https://instantview.telegram.org/docs?v=2.1)
