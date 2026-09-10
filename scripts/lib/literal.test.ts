import { describe, it, expect } from "vitest";
import { parseArrayLiteral, literalToJson, extractArrayLiteral } from "./literal";

describe("extractArrayLiteral", () => {
  it("extracts a balanced array after a marker", () => {
    expect(extractArrayLiteral("export const x = [1, 2];", "export const x")).toBe("[1, 2]");
  });
  it("handles nested arrays", () => {
    expect(extractArrayLiteral("const x = [[1], [2]];", "const x")).toBe("[[1], [2]]");
  });
  it("skips a type annotation's empty brackets", () => {
    expect(
      extractArrayLiteral("const x: Item[] = [1, 2];", "const x"),
    ).toBe("[1, 2]");
  });
  it("ignores brackets inside strings", () => {
    expect(extractArrayLiteral('const x = ["]"];', "const x")).toBe('["]"]');
  });
});

describe("literalToJson", () => {
  it("quotes unquoted keys", () => {
    expect(JSON.parse(literalToJson("[{ a: 1 }]"))).toEqual([{ a: 1 }]);
  });
  it("converts single-quoted strings", () => {
    expect(JSON.parse(literalToJson("[{ a: 'x' }]"))).toEqual([{ a: "x" }]);
  });
  it("drops trailing commas", () => {
    expect(JSON.parse(literalToJson("[{ a: 1, },]"))).toEqual([{ a: 1 }]);
  });
  it("strips line comments", () => {
    expect(JSON.parse(literalToJson("[\n// note\n{ a: 1 }\n]"))).toEqual([{ a: 1 }]);
  });
  it("preserves Persian text and colons inside strings", () => {
    expect(JSON.parse(literalToJson('[{ t: "شماره‌ اول: ۱" }]'))).toEqual([
      { t: "شماره‌ اول: ۱" },
    ]);
  });
  it("preserves rgba values", () => {
    expect(JSON.parse(literalToJson('[{ c: "rgba(73,94,113,0.4)" }]'))).toEqual([
      { c: "rgba(73,94,113,0.4)" },
    ]);
  });
});

describe("parseArrayLiteral", () => {
  it("parses a realistic legacy entry", () => {
    const source = `
export const featureList = [
  {
    file: "00000001",
    slug: "00000001",
    title: "00000001",
    date: "۱۴۰۲/۰۹/۰۷",
    imageSrc: "/img/00000001.jpg",
    description: "شماره‌ اول ",
    themeColor: "rgba(73,94,113,0.4)",
  },
].reverse();
`;
    const parsed = parseArrayLiteral<{ file: string; themeColor: string }>(
      source,
      "export const featureList",
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0].file).toBe("00000001");
    expect(parsed[0].themeColor).toBe("rgba(73,94,113,0.4)");
  });
});
