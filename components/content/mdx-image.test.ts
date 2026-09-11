import { describe, it, expect } from "vitest";
import { resolveMdxSrc } from "./mdx-image";

describe("resolveMdxSrc", () => {
  const base = "/content/issues/00000101/quantum";

  it("resolves a ./img/ path against the base", () => {
    expect(resolveMdxSrc("./img/1.png", base)).toBe(`${base}/img/1.png`);
  });
  it("resolves a bare relative path", () => {
    expect(resolveMdxSrc("img/1.png", base)).toBe(`${base}/img/1.png`);
  });
  it("leaves an absolute path untouched", () => {
    expect(resolveMdxSrc("/img/logo.svg", base)).toBe("/img/logo.svg");
  });
  it("leaves a remote URL untouched", () => {
    expect(resolveMdxSrc("https://x.test/a.png", base)).toBe(
      "https://x.test/a.png",
    );
  });
  it("falls back to root when no base is given", () => {
    expect(resolveMdxSrc("./img/1.png")).toBe("/img/1.png");
  });
});
