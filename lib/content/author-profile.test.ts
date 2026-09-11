import { describe, expect, it } from "vitest";

import {
  authorHasEntryYear,
  authorHasPhoto,
  normalizeAuthorImage,
  normalizeAuthorTitle,
} from "./author-profile";

describe("author profile helpers", () => {
  it("treats the shared noone.svg as no photo", () => {
    expect(authorHasPhoto("/img/authors/noone.svg")).toBe(false);
    expect(normalizeAuthorImage("/img/authors/noone.svg")).toBeUndefined();
    expect(authorHasPhoto("/img/authors/ahmz.png")).toBe(true);
    expect(normalizeAuthorImage("/img/authors/ahmz.png")).toBe(
      "/img/authors/ahmz.png",
    );
  });

  it("rejects blank and placeholder titles as entry years", () => {
    expect(authorHasEntryYear('" "')).toBe(false);
    expect(authorHasEntryYear("کارشناسی ۱۴XX")).toBe(false);
    expect(authorHasEntryYear("هم‌بنیان‌گذار Relabs")).toBe(false);
    expect(authorHasEntryYear("کارشناسی ۱۴۰۲")).toBe(true);
    expect(authorHasEntryYear("کارشناسی ۱۳۹۶")).toBe(true);
    expect(normalizeAuthorTitle('" "')).toBeUndefined();
    expect(normalizeAuthorTitle("کارشناسی ۱۴۰۲")).toBe("کارشناسی ۱۴۰۲");
  });
});
