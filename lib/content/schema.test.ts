import { describe, it, expect } from "vitest";
import {
  articleFrontmatterSchema,
  issueMetaSchema,
  authorSchema,
} from "./schema";

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
    const { tags: _tags, authors: _authors, ...rest } = valid;
    const parsed = articleFrontmatterSchema.parse(rest);
    expect(parsed.tags).toEqual([]);
    expect(parsed.authors).toEqual([]);
  });

  it("rejects a non-ISO date", () => {
    expect(() =>
      articleFrontmatterSchema.parse({ ...valid, date: "۱۴۰۴/۰۶/۳۱" }),
    ).toThrow();
  });

  it("rejects a missing title", () => {
    const { title: _title, ...rest } = valid;
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
