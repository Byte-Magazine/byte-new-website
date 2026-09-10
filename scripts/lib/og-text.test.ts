import { describe, it, expect } from "vitest";
import { rtlLines } from "../generate-og";

describe("rtlLines", () => {
  it("reverses word order so LTR layout reads right-to-left", () => {
    expect(rtlLines("یک دو سه", 100)).toEqual([["سه", "دو", "یک"]]);
  });

  it("wraps at the character budget", () => {
    const lines = rtlLines("aaaa bbbb cccc dddd", 10);
    expect(lines.length).toBeGreaterThan(1);
  });

  it("reverses Persian digit runs so they render correctly", () => {
    expect(rtlLines("۱۶ مطلب", 100)).toEqual([["مطلب", "۶۱"]]);
  });

  it("leaves a single digit untouched", () => {
    expect(rtlLines("۸ شماره", 100)).toEqual([["شماره", "۸"]]);
  });

  it("collapses repeated whitespace", () => {
    expect(rtlLines("  یک   دو  ", 100)).toEqual([["دو", "یک"]]);
  });
});
