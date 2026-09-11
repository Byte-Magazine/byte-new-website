import { describe, it, expect } from "vitest";
import { buildMetadata, articleJsonLd, personJsonLd } from "./seo";
import { SITE } from "./site";

describe("buildMetadata", () => {
  it("keeps the page title", () => {
    const meta = buildMetadata({ title: "مقاله", description: "توضیح", path: "/x" });
    expect(String(meta.title)).toContain("مقاله");
  });

  it("sets an absolute canonical URL", () => {
    const meta = buildMetadata({ title: "t", description: "d", path: "/mags/00000101" });
    expect(meta.alternates?.canonical).toBe(`${SITE.url}/mags/00000101`);
  });

  it("sets openGraph locale to fa_IR", () => {
    const meta = buildMetadata({ title: "t", description: "d", path: "/" });
    expect(meta.openGraph?.locale).toBe("fa_IR");
  });

  it("falls back to the site description", () => {
    const meta = buildMetadata({ title: "t", path: "/" });
    expect(meta.description).toBe(SITE.description);
  });

  it("passes an explicit image through", () => {
    const meta = buildMetadata({ title: "t", path: "/", image: "/og/x.png" });
    expect(JSON.stringify(meta.openGraph?.images)).toContain("/og/x.png");
  });

  it("defaults to the legacy social-card for link previews", () => {
    const meta = buildMetadata({ title: "t", path: "/" });
    expect(JSON.stringify(meta.openGraph?.images)).toContain(
      "/img/social-card.png",
    );
  });
});

describe("articleJsonLd", () => {
  it("emits an Article node with ISO dates and authors", () => {
    const ld = articleJsonLd({
      title: "مقاله",
      description: "توضیح",
      url: "/mags/00000101/x",
      date: "2025-09-22",
      authors: [{ name: "معین", url: "/authors/Moeein" }],
    });
    expect(ld["@type"]).toBe("Article");
    expect(ld.datePublished).toBe("2025-09-22");
    expect(ld.author[0].name).toBe("معین");
    expect(ld.mainEntityOfPage).toContain(SITE.url);
  });
});

describe("personJsonLd", () => {
  it("emits a Person node with an absolute url", () => {
    const ld = personJsonLd({ name: "معین", url: "/authors/Moeein" });
    expect(ld["@type"]).toBe("Person");
    expect(ld.url).toBe(`${SITE.url}/authors/Moeein`);
  });
});
