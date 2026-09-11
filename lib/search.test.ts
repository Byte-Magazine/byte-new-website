import { describe, it, expect } from "vitest";
import { searchDocs, type SearchDoc } from "./search";

const docs: SearchDoc[] = [
  {
    url: "/a",
    title: "رایانش کوانتومی",
    description: "کیوبیت",
    tags: ["Quantum"],
    authors: ["امیرمهدی"],
    kind: "article",
  },
  {
    url: "/b",
    title: "برنامه‌نویسی وب",
    description: "ری‌اکت",
    tags: ["Web"],
    authors: ["معین"],
    kind: "article",
  },
  {
    url: "/c",
    title: "DevOps چیست",
    description: "استقرار",
    tags: ["DevOps"],
    authors: ["معین"],
    kind: "blog",
  },
];

describe("searchDocs", () => {
  it("matches a Persian title", () => {
    expect(searchDocs(docs, "کوانتومی").map((d) => d.url)).toEqual(["/a"]);
  });

  it("matches regardless of Arabic vs Persian yeh", () => {
    expect(searchDocs(docs, "برنامه‌نويسی").map((d) => d.url)).toContain("/b");
  });

  it("matches ignoring ZWNJ", () => {
    expect(searchDocs(docs, "برنامه نویسی").map((d) => d.url)).toContain("/b");
  });

  it("matches a Latin tag case-insensitively", () => {
    expect(searchDocs(docs, "devops").map((d) => d.url)).toContain("/c");
  });

  it("matches an author name", () => {
    expect(
      searchDocs(docs, "معین")
        .map((d) => d.url)
        .sort(),
    ).toEqual(["/b", "/c"]);
  });

  it("ranks title matches above description matches", () => {
    const results = searchDocs(docs, "کیوبیت");
    expect(results[0].url).toBe("/a");
  });

  it("returns an empty array for an empty query", () => {
    expect(searchDocs(docs, "  ")).toEqual([]);
  });

  it("respects the limit", () => {
    expect(searchDocs(docs, "معین", 1)).toHaveLength(1);
  });

  it("matches all terms in a multi-word query", () => {
    expect(searchDocs(docs, "رایانش کوانتومی").map((d) => d.url)).toEqual([
      "/a",
    ]);
  });

  it("returns nothing when a term does not match", () => {
    expect(searchDocs(docs, "کوانتومی زامبی")).toEqual([]);
  });
});
