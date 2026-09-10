import { describe, it, expect } from "vitest";
import { extractHeadings, slugifyHeading } from "./toc";

describe("extractHeadings", () => {
  it("extracts h2 and h3 headings", () => {
    const out = extractHeadings("## یک\n\nمتن\n\n### دو");
    expect(out.map((h) => h.text)).toEqual(["یک", "دو"]);
    expect(out.map((h) => h.level)).toEqual([2, 3]);
  });

  it("ignores h1 and h4", () => {
    expect(extractHeadings("# یک\n#### چهار")).toEqual([]);
  });

  it("ignores headings inside fenced code", () => {
    expect(extractHeadings("```sh\n## not a heading\n```")).toEqual([]);
  });

  it("strips inline markdown and jsx from heading text", () => {
    const [heading] = extractHeadings("## **پررنگ** <span>x</span>");
    expect(heading.text).toBe("پررنگ x");
  });

  it("generates an id for each heading", () => {
    const [heading] = extractHeadings("## رایانش کوانتومی");
    expect(heading.id).toBeTruthy();
    expect(heading.id).not.toContain(" ");
  });
});

describe("slugifyHeading", () => {
  it("joins words with hyphens", () => {
    expect(slugifyHeading("رایانش کوانتومی")).toBe("رایانش-کوانتومی");
  });
  it("drops punctuation", () => {
    expect(slugifyHeading("چیست؟")).toBe("چیست");
  });
});
