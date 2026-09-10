import { describe, it, expect } from "vitest";
import {
  toPersianDigits,
  normalizePersian,
  formatJalali,
  formatJalaliLong,
  readingTimeMinutes,
} from "./persian";

describe("toPersianDigits", () => {
  it("converts ASCII digits", () => {
    expect(toPersianDigits("2025")).toBe("۲۰۲۵");
  });
  it("accepts numbers", () => {
    expect(toPersianDigits(95)).toBe("۹۵");
  });
  it("leaves non-digits untouched", () => {
    expect(toPersianDigits("v1.2")).toBe("v۱.۲");
  });
});

describe("normalizePersian", () => {
  it("folds Arabic yeh to Persian yeh", () => {
    expect(normalizePersian("علي")).toBe(normalizePersian("علی"));
  });
  it("folds Arabic kaf to Persian kaf", () => {
    expect(normalizePersian("كتاب")).toBe(normalizePersian("کتاب"));
  });
  it("strips ZWNJ", () => {
    expect(normalizePersian("می‌شود")).toBe("میشود");
  });
  it("collapses whitespace and lowercases latin", () => {
    expect(normalizePersian("  Quantum   Computing ")).toBe("quantum computing");
  });
  it("normalizes Persian digits to ASCII", () => {
    expect(normalizePersian("۱۴۰۴")).toBe("1404");
  });
});

describe("formatJalali", () => {
  it("formats an ISO date as a Jalali slash date in Persian digits", () => {
    expect(formatJalali("2025-09-22")).toBe("۱۴۰۴/۰۶/۳۱");
  });
  it("formats a date in the first Jalali month", () => {
    expect(formatJalali("2025-03-21")).toBe("۱۴۰۴/۰۱/۰۱");
  });
});

describe("formatJalaliLong", () => {
  it("formats an ISO date with the Persian month name", () => {
    expect(formatJalaliLong("2025-09-22")).toContain("شهریور");
    expect(formatJalaliLong("2025-09-22")).toContain("۱۴۰۴");
  });
});

describe("readingTimeMinutes", () => {
  it("returns at least 1 minute for short text", () => {
    expect(readingTimeMinutes("سلام دنیا")).toBe(1);
  });
  it("scales with word count at 200 wpm", () => {
    const text = Array.from({ length: 600 }, () => "کلمه").join(" ");
    expect(readingTimeMinutes(text)).toBe(3);
  });
  it("ignores markdown syntax and code fences", () => {
    const withCode =
      "سلام\n\n```js\n" +
      Array.from({ length: 600 }, () => "word").join(" ") +
      "\n```\n";
    expect(readingTimeMinutes(withCode)).toBe(1);
  });
});
