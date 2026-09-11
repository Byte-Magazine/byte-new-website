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

---

## Rules (paste into the editor)

```
~version: "2.1"

?path: /mags/[01]{8}/.+|/blog/.+|/workshops/[^/]+/.+

site_name: "بایت"
channel: "@byte_mag"

@remove: //nav
@remove: //aside
@remove: //footer
@remove: //details
@remove: //script
@remove: //style
@remove: //*[@data-iv="ignore"]

title: //article//h1

# Do NOT map description to `subtitle` — IV renders subtitle huge.
# Keep OG description only for the small link preview card.
author: //article/header//ul//a
author_url: //article/header//ul//a/@href
published_date: //article//time/@datetime
body: //article//div[has-class("prose")]

image_url: //meta[@property="og:image"]/@content
description: //meta[@property="og:description"]/@content

@set_attr(dir, "rtl"): $body
```

`description` / `image_url` only affect the **small link preview card**, not
Instant View typography.

Full reference: [Instant View Manual 2.1](https://instantview.telegram.org/docs?v=2.1)
