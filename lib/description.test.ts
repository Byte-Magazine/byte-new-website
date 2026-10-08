import { describe, expect, it } from "vitest";

import {
  DESCRIPTION_MAX,
  excerpt,
  authorDescription,
  issueDescription,
  metaDescription,
  proseBlocks,
  quotedList,
  tagDescription,
  truncate,
} from "./description";

const LONG =
  "این یک پاراگراف نسبتاً بلند است که برای آزمودن برش توضیحات نوشته شده و باید از حد مجاز بیشتر باشد تا بریده شود. ";

describe("proseBlocks", () => {
  it("drops headings, code, math, tables and images", () => {
    const body = [
      "## عنوان",
      "```js\nconst x = 1;\n```",
      "$$\nx^2\n$$",
      "| a | b |\n|---|---|",
      '<div style={{ textAlign: "center" }}>![](./img/a.png)</div>',
      'متن اصلی مقاله با یک [پیوند](https://x.y) و **تأکید** و <Tooltip tip="t"><span>واژه</span></Tooltip> است.',
    ].join("\n\n");
    expect(proseBlocks(body)).toEqual([
      "متن اصلی مقاله با یک پیوند و تأکید و واژه است.",
    ]);
  });

  it("drops inline style blocks and template literals", () => {
    const body = `<style>{\`.a { display: flex; gap: 1em; color: red; }\`}</style>\n\n${LONG}`;
    expect(proseBlocks(body)).toEqual([LONG.trim()]);
  });

  it("drops HTML heading elements", () => {
    const body = `<h2 className="t">تیتری که نباید بیاید</h2>\n<p>${LONG}</p>`;
    expect(proseBlocks(body)[0]).not.toContain("تیتری");
  });

  it("drops headings nested in JSX and JSX spacers", () => {
    const body = `<div>\n  ## تیتر\n  <p>${LONG}{" "}ادامه</p>\n</div>`;
    const [block] = proseBlocks(body);
    expect(block).not.toContain("##");
    expect(block).not.toContain('{"');
    expect(block).toContain("ادامه");
  });

  it("skips caption-length blocks", () => {
    expect(proseBlocks("شکل ۱: نمودار")).toEqual([]);
  });

  it("strips redaction bars", () => {
    expect(proseBlocks(`████ ${LONG}`)[0].startsWith("این")).toBe(true);
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("کوتاه")).toBe("کوتاه");
  });

  it("cuts at a word boundary within the limit", () => {
    const out = truncate(LONG.repeat(3));
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out.endsWith("…")).toBe(true);
    expect(out.at(-2)).not.toBe(" ");
  });
});

describe("metaDescription", () => {
  const body = LONG.repeat(3);

  it("keeps a long-enough hand-written description", () => {
    const own = "ت".repeat(80);
    expect(metaDescription(own, body)).toBe(own);
  });

  it("uses the opening when there is no description", () => {
    expect(metaDescription("", body)).toBe(excerpt(body));
  });

  it("tops up a short teaser with the opening", () => {
    const out = metaDescription("آیا می‌دانید؟", body);
    expect(out.startsWith("آیا می‌دانید؟ — این")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("does not repeat a teaser the body opens with", () => {
    const out = metaDescription("این یک پاراگراف", body);
    expect(out.startsWith("این یک پاراگراف نسبتاً")).toBe(true);
  });

  it("falls back to the teaser when the body has no prose", () => {
    expect(metaDescription("کوتاه", "## فقط عنوان")).toBe("کوتاه");
  });
});

describe("quotedList", () => {
  it("joins with Persian separators", () => {
    expect(quotedList(["الف"])).toBe("«الف»");
    expect(quotedList(["الف", "ب", "پ"])).toBe("«الف»، «ب» و «پ»");
  });
});

describe("issueDescription / tagDescription", () => {
  it("lists an issue's articles", () => {
    const out = issueDescription({
      number: "00000100",
      description: "شماره چهارم",
      articles: [{ title: "الف" }, { title: "ب" }],
    });
    expect(out).toBe(
      "شمارهٔ 00000100 نشریه‌ی بایت، شماره چهارم؛ با مطالبی چون «الف» و «ب»",
    );
  });

  it("never cuts a title and never repeats one", () => {
    const long = "ع".repeat(60);
    const out = tagDescription({
      name: "AI",
      count: 4,
      articles: [
        { title: long },
        { title: long },
        { title: "ب" },
        { title: "پ" },
      ],
      blogPosts: [],
    });
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(out).not.toContain("…");
    expect(out.split(long).length - 1).toBe(1);
  });

  it("counts a tag in Persian digits", () => {
    const out = tagDescription({
      name: "AI",
      count: 3,
      articles: [{ title: "الف" }],
      blogPosts: [],
    });
    expect(out).toBe("۳ مطلب با برچسب «AI» در نشریه‌ی بایت، از جمله «الف»");
  });
});

describe("authorDescription", () => {
  it("names the role, count and pieces", () => {
    const out = authorDescription({
      name: "سارا",
      title: "کارشناسی ۱۴۰۳",
      articleCount: 1,
      articles: [{ title: "الف" }],
      blogPosts: [],
      staffSections: ["تحریریه"],
    });
    expect(out).toBe(
      "سارا — کارشناسی ۱۴۰۳؛ عضو تیم تحریریه، نویسندهٔ ۱ مطلب در نشریه‌ی بایت: «الف»",
    );
  });

  it("uses the editor-in-chief title as is", () => {
    const out = authorDescription({
      name: "آرش",
      articleCount: 0,
      articles: [],
      blogPosts: [],
      staffSections: ["مدیر مسئول و سردبیر"],
    });
    expect(out).toBe("آرش؛ مدیر مسئول و سردبیر در نشریه‌ی بایت");
  });

  it("falls back to the name alone", () => {
    expect(
      authorDescription({
        name: "سارا",
        articleCount: 0,
        articles: [],
        blogPosts: [],
        staffSections: [],
      }),
    ).toBe("سارا");
  });
});
