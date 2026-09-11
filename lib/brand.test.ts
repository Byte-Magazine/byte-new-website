import { describe, it, expect } from "vitest";
import { accentFromColor } from "./brand";

describe("accentFromColor", () => {
  it("derives a light and a dark accent from an rgba colour", () => {
    const a = accentFromColor("rgba(167, 0, 0, 0.4)");
    expect(a.light).toMatch(/^oklch\(/);
    expect(a.dark).toMatch(/^oklch\(/);
    expect(a.light).not.toBe(a.dark);
  });

  it("keeps the hue of the source colour", () => {
    const red = accentFromColor("rgba(220, 20, 20, 1)");
    const blue = accentFromColor("rgba(20, 20, 220, 1)");
    const hue = (v: string) => Number(v.match(/ ([\d.]+)\)$/)![1]);
    expect(Math.abs(hue(red.light) - hue(blue.light))).toBeGreaterThan(60);
  });

  it("makes the dark accent lighter than the light one", () => {
    const a = accentFromColor("rgba(61, 107, 236, 0.4)");
    const l = (v: string) => Number(v.match(/oklch\(([\d.]+)/)![1]);
    expect(l(a.dark)).toBeGreaterThan(l(a.light));
  });

  it("gives a desaturated source a chroma floor", () => {
    const a = accentFromColor("rgba(128, 128, 128, 1)");
    const chroma = Number(a.light.match(/oklch\([\d.]+ ([\d.]+)/)![1]);
    expect(chroma).toBeGreaterThanOrEqual(0.07);
  });

  it("caps chroma so a vivid source stays usable", () => {
    const a = accentFromColor("rgb(255, 0, 255)");
    const chroma = Number(a.light.match(/oklch\([\d.]+ ([\d.]+)/)![1]);
    expect(chroma).toBeLessThanOrEqual(0.16);
  });

  it("falls back when the colour cannot be parsed", () => {
    const a = accentFromColor("not a colour");
    expect(a.light).toBe("oklch(0.36 0.09 264)");
  });
});
