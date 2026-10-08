import { describe, expect, it } from "vitest";

import { escapeXml, getFeedItems, renderFeed, rfc822 } from "./feed";
import { SITE } from "./site";

describe("escapeXml", () => {
  it("escapes the five XML entities", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });
});

describe("rfc822", () => {
  it("formats an ISO date in UTC", () => {
    expect(rfc822("2025-11-20")).toBe("Thu, 20 Nov 2025 00:00:00 GMT");
  });
});

describe("renderFeed", () => {
  const item = {
    title: "عنوان & <تست>",
    description: "توضیح",
    url: "/mags/00000001/x",
    date: "2025-11-20",
    authors: ["نویسنده"],
    tags: ["هوش مصنوعی"],
  };

  it("emits a slashed permalink and escaped title", () => {
    const xml = renderFeed([item]);
    expect(xml).toContain(`<link>${SITE.url}/mags/00000001/x/</link>`);
    expect(xml).toContain("<title>عنوان &amp; &lt;تست&gt;</title>");
    expect(xml).toContain("<dc:creator>نویسنده</dc:creator>");
    expect(xml).toContain("<category>هوش مصنوعی</category>");
  });

  it("omits an empty description", () => {
    expect(renderFeed([{ ...item, description: "" }])).not.toContain(
      "<description>توضیح",
    );
  });

  it("renders a valid channel with no items", () => {
    const xml = renderFeed([]);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
    expect(xml).not.toContain("lastBuildDate");
  });
});

describe("getFeedItems", () => {
  it("returns newest first and honours the limit", () => {
    const items = getFeedItems(10);
    expect(items.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].date >= items[i].date).toBe(true);
    }
  });
});
