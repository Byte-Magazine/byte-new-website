# Telegram Instant View template for byte-mag.ir
#
# How to enable Instant View (cannot be done with meta tags alone):
# 1. Open https://instantview.telegram.org/ and sign in with Telegram
# 2. Paste a sample article URL, e.g.
#    https://byte-mag.ir/mags/00001000/Killing-Machine-01/
# 3. Choose domain level: byte-mag.ir
# 4. Paste everything below the --- into the Rules panel
# 5. Track 10–15 URLs (articles, blog posts, workshops) and fix issues
# 6. Save → test via the generated t.me/iv?url=…&rhash=… link
# 7. Submit for Telegram review so the lightning button appears for everyone
#
# Until approval, only your rhash link shows Instant View.

---

~version: "2.0"

# Only long-form reading pages — never list/archive/home.
?path: /mags/[01]+/.+
?path: /blog/.+
?path: /workshops/.+/.+

site_name: "بایت"
channel: "@byte_mag"

# Drop chrome Telegram should not show in the reader.
@remove: //header[not(ancestor::*[@data-iv="article"])]
@remove: //footer
@remove: //nav
@remove: //aside
@remove: //details
@remove: //*[@data-iv="ignore"]
@remove: //script
@remove: //style

title: //*[@data-iv="article"]//h1
subtitle: //*[@data-iv="subtitle"]
author: //*[@data-iv="author"]
author_url: //*[@data-iv="author"]/@href
published_date: //*[@data-iv="date"]/@datetime
body: //*[@data-iv="body"]

# Fallback if markers are missing on an older deploy.
@if_not_exists(title) {
  title: //article//h1
}
@if_not_exists(body) {
  body: //article//div[has-class("prose")]
}

# Link preview extras from Open Graph when present.
image_url: //meta[@property="og:image"]/@content
description: //meta[@property="og:description"]/@content
