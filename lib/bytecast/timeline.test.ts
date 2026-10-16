import { describe, expect, it } from "vitest";

import { chapterIndexAt, formatClock, speakerAt } from "./timeline";

const chapters = [
  { at: 0, title: "الف" },
  { at: 10, title: "ب" },
  { at: 87.21, title: "پ" },
];

describe("chapterIndexAt", () => {
  it("returns the last chapter that has started", () => {
    expect(chapterIndexAt(chapters, 0)).toBe(0);
    expect(chapterIndexAt(chapters, 9.99)).toBe(0);
    expect(chapterIndexAt(chapters, 10)).toBe(1);
    expect(chapterIndexAt(chapters, 86.9)).toBe(1);
    // Whole-second clocks: 87 is where the chapter at 87.21 is shown from.
    expect(chapterIndexAt(chapters, 87)).toBe(2);
    expect(chapterIndexAt(chapters, 5000)).toBe(2);
  });

  it("clamps negative and non-finite times to the first chapter", () => {
    expect(chapterIndexAt(chapters, -3)).toBe(0);
    expect(chapterIndexAt(chapters, Number.NaN)).toBe(0);
  });

  it("returns -1 for an episode without chapters", () => {
    expect(chapterIndexAt([], 12)).toBe(-1);
  });
});

describe("speakerAt", () => {
  const turns: [number, number, "host" | "guest"][] = [
    [0, 16.85, "host"],
    [16.85, 21.85, "guest"],
  ];

  it("shifts turns by the offset of the published file", () => {
    expect(speakerAt(turns, 5, 10)).toBeNull();
    expect(speakerAt(turns, 10, 10)).toBe("host");
    expect(speakerAt(turns, 26.84, 10)).toBe("host");
    expect(speakerAt(turns, 26.85, 10)).toBe("guest");
  });

  it("is silent outside every turn", () => {
    expect(speakerAt(turns, 40, 10)).toBeNull();
    expect(speakerAt([], 1, 0)).toBeNull();
  });
});

describe("formatClock", () => {
  it("formats minutes and seconds with Persian digits", () => {
    expect(formatClock(0)).toBe("۰۰:۰۰");
    expect(formatClock(65.9)).toBe("۰۱:۰۵");
    expect(formatClock(1300.64)).toBe("۲۱:۴۰");
  });

  it("adds hours past an hour", () => {
    expect(formatClock(3725)).toBe("۱:۰۲:۰۵");
  });

  it("treats bad input as zero", () => {
    expect(formatClock(Number.NaN)).toBe("۰۰:۰۰");
    expect(formatClock(-4)).toBe("۰۰:۰۰");
  });
});
