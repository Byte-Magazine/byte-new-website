import { describe, it, expect } from "vitest";
import {
  buildMetadata,
  articleJsonLd,
  breadcrumbJsonLd,
  issueJsonLd,
  pageUrl,
  personJsonLd,
} from "./seo";
import { SITE } from "./site";

describe("buildMetadata", () => {
  it("keeps the page title", () => {
    const meta = buildMetadata({
      title: "مقاله",
      description: "توضیح",
      path: "/x",
    });
    expect(String(meta.title)).toContain("مقاله");
  });

  it("sets an absolute canonical URL", () => {
    const meta = buildMetadata({
      title: "t",
      description: "d",
      path: "/mags/00000101",
    });
    expect(meta.alternates?.canonical).toBe(`${SITE.url}/mags/00000101/`);
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

describe("buildMetadata title suffix", () => {
  it("lets short titles take the site template", () => {
    expect(buildMetadata({ title: "کوتاه", path: "/" }).title).toBe("کوتاه");
  });

  it("drops the site suffix from long titles", () => {
    const title = "ع".repeat(60);
    expect(buildMetadata({ title, path: "/" }).title).toEqual({
      absolute: title,
    });
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
    expect(ld.mainEntityOfPage).toBe(`${SITE.url}/mags/00000101/x/`);
    expect(ld.isAccessibleForFree).toBe(true);
    expect(ld.image).toBeUndefined();
  });

  it("emits absolute image URLs when an image is given", () => {
    const ld = articleJsonLd({
      title: "t",
      description: "d",
      url: "/blog/x",
      date: "2025-09-22",
      authors: [],
      image: "/og/blog-x.png",
      type: "BlogPosting",
    });
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.image).toEqual([`${SITE.url}/og/blog-x.png`]);
  });
});

describe("personJsonLd", () => {
  it("emits a Person node with an absolute url", () => {
    const ld = personJsonLd({ name: "معین", url: "/authors/Moeein" });
    expect(ld["@type"]).toBe("Person");
    expect(ld.url).toBe(`${SITE.url}/authors/Moeein/`);
  });
});

describe("pageUrl", () => {
  it("always ends with a trailing slash to match the exported routes", () => {
    expect(pageUrl("/articles")).toBe(`${SITE.url}/articles/`);
    expect(pageUrl("/articles/")).toBe(`${SITE.url}/articles/`);
    expect(pageUrl("mags/00000001")).toBe(`${SITE.url}/mags/00000001/`);
  });

  it("maps the home page to the site root", () => {
    expect(pageUrl("/")).toBe(`${SITE.url}/`);
  });
});

describe("issueJsonLd", () => {
  it("names the issue and links its image and canonical URL", () => {
    const ld = issueJsonLd({
      number: "00000101",
      url: "/mags/00000101",
      date: "2025-09-22",
      description: "",
      image: "/og/issue-00000101.png",
    });
    expect(ld.name).toContain("00000101");
    expect(ld.url).toBe(`${SITE.url}/mags/00000101/`);
    expect(ld.image).toBe(`${SITE.url}/og/issue-00000101.png`);
    expect("description" in ld).toBe(false);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers items from 1 and uses canonical URLs", () => {
    const ld = breadcrumbJsonLd([
      { name: "a", url: "/a" },
      { name: "b", url: "/a/b" },
    ]);
    expect(ld.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1].item).toBe(`${SITE.url}/a/b/`);
  });
});
