import { describe, it, expect } from "vitest";
import { parseJalaliDate } from "./jalali";
import { formatJalali } from "../../lib/persian";

describe("parseJalaliDate", () => {
  it("converts a known date", () => {
    expect(parseJalaliDate("۱۴۰۴/۰۶/۳۱")).toBe("2025-09-22");
  });

  it("accepts ASCII digits", () => {
    expect(parseJalaliDate("1404/01/01")).toBe("2025-03-21");
  });

  it("round-trips against Intl for every legacy issue date", () => {
    const dates = [
      "۱۴۰۲/۰۹/۰۷", "۱۴۰۴/۰۲/۳۱", "۱۴۰۴/۰۴/۲۲", "۱۴۰۴/۰۵/۲۹",
      "۱۴۰۴/۰۶/۳۱", "۱۴۰۴/۰۷/۲۴", "۱۴۰۴/۰۸/۲۰", "۱۴۰۵/۰۵/۰۵",
    ];
    for (const jalali of dates) {
      expect(formatJalali(parseJalaliDate(jalali))).toBe(jalali);
    }
  });

  it("throws on an unrecognized format", () => {
    expect(() => parseJalaliDate("nope")).toThrow();
  });
});
