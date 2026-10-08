import { describe, expect, it } from "vitest";

import { changedPaths, isValidKey, pageFingerprint } from "./indexnow";

const page = (main: string, chunk = "abc") =>
  `<html><head><title>T</title><meta name="description" content="d"/>` +
  `<script src="/_next/static/chunks/${chunk}.js"></script></head>` +
  `<body><main>${main}</main><script>self.__next_f.push("${chunk}")</script></body></html>`;

describe("pageFingerprint", () => {
  it("ignores build-specific bundles and payloads", () => {
    expect(pageFingerprint(page("x", "a1"))).toBe(
      pageFingerprint(page("x", "b2")),
    );
  });

  it("is stable for pages without a <main> element", () => {
    const bare = (chunk: string) => page("x", chunk).replace(/<\/?main>/g, "");
    expect(pageFingerprint(bare("a1"))).toBe(pageFingerprint(bare("b2")));
  });

  it("changes when the main content changes", () => {
    expect(pageFingerprint(page("x"))).not.toBe(pageFingerprint(page("y")));
  });

  it("changes when the description changes", () => {
    expect(pageFingerprint(page("x"))).not.toBe(
      pageFingerprint(page("x").replace('content="d"', 'content="e"')),
    );
  });
});

describe("changedPaths", () => {
  it("submits everything when there is no previous manifest", () => {
    expect(changedPaths(null, { "/b/": "1", "/a/": "2" })).toEqual([
      "/a/",
      "/b/",
    ]);
  });

  it("reports added, changed and removed pages only", () => {
    const previous = { "/same/": "1", "/edit/": "1", "/gone/": "1" };
    const next = { "/same/": "1", "/edit/": "2", "/new/": "1" };
    expect(changedPaths(previous, next)).toEqual(["/edit/", "/gone/", "/new/"]);
  });
});

describe("isValidKey", () => {
  it("accepts IndexNow's key format", () => {
    expect(isValidKey("abcd1234")).toBe(true);
    expect(isValidKey("short")).toBe(false);
    expect(isValidKey("has space here")).toBe(false);
  });
});
