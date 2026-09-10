import { describe, it, expect } from "vitest";
import { mergeAuthors, expandSocialUrl } from "./people";

describe("expandSocialUrl", () => {
  it("expands a bare github handle", () => {
    expect(expandSocialUrl("github", "spneshaei")).toBe(
      "https://github.com/spneshaei",
    );
  });
  it("expands a bare linkedin handle", () => {
    expect(expandSocialUrl("linkedin", "moeein")).toBe(
      "https://www.linkedin.com/in/moeein",
    );
  });
  it("passes a full URL through unchanged", () => {
    expect(expandSocialUrl("github", "https://github.com/EmadEJ")).toBe(
      "https://github.com/EmadEJ",
    );
  });
  it("strips a leading @ from a handle", () => {
    expect(expandSocialUrl("x", "@byte")).toBe("https://x.com/byte");
  });
  it("leaves an unknown platform value untouched", () => {
    expect(expandSocialUrl("website", "byte-mag.ir")).toBe("byte-mag.ir");
  });
});

describe("mergeAuthors", () => {
  const mags = {
    Moeein: {
      name: "معین آعلی",
      title: "کارشناسی ۱۴۰۱",
      image_url: "/img/staff/moeein.jpg",
      socials: { github: "https://github.com/moeeinaali" },
    },
  };
  const blog = {
    Moeein: {
      name: "معین آعلی",
      title: "کارشناسی ۱۴۰۱",
      image_url: "/img/staff/moeein.jpg",
      socials: { github: "moeeinaali", linkedin: "moeein" },
    },
    Alinejad: {
      name: "مهدی علی‌نژاد",
      image_url: "/img/staff/MahdiAlinejhad.jpg",
      socials: {},
    },
  };
  const staff = [
    {
      name: "صفحه‌آرایی و گرافیک",
      staffList: [
        {
          name: "معین آعلی",
          title: "کارشناسی ۱۴۰۱",
          imageURL: "/img/staff/moeein.jpg",
          socials: {},
        },
      ],
    },
  ];

  it("produces one record per unique author id", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    expect(authors.map((a) => a.id).sort()).toEqual(["Alinejad", "Moeein"]);
  });

  it("unions socials across sources and expands handles", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    const moeein = authors.find((a) => a.id === "Moeein")!;
    expect(moeein.socials.github).toBe("https://github.com/moeeinaali");
    expect(moeein.socials.linkedin).toBe("https://www.linkedin.com/in/moeein");
  });

  it("links a staff member to an author id by matching name", () => {
    const { staff: sections } = mergeAuthors(mags, blog, staff);
    expect(sections[0].members[0].authorId).toBe("Moeein");
  });

  it("matches names across yeh and ZWNJ variants", () => {
    const variantStaff = [
      { name: "بخش", staffList: [{ name: "مهدي علی نژاد", socials: {} }] },
    ];
    const { staff: sections } = mergeAuthors(mags, blog, variantStaff);
    expect(sections[0].members[0].authorId).toBe("Alinejad");
  });

  it("warns about a staff member with no matching author", () => {
    const orphan = [{ name: "بخش", staffList: [{ name: "ناشناس", socials: {} }] }];
    const { warnings } = mergeAuthors(mags, blog, orphan);
    expect(warnings.some((w) => w.includes("ناشناس"))).toBe(true);
  });

  it("maps image_url to image", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    expect(authors.find((a) => a.id === "Alinejad")!.image).toBe(
      "/img/staff/MahdiAlinejhad.jpg",
    );
  });

  it("produces records that satisfy the author schema", () => {
    const { authors } = mergeAuthors(mags, blog, staff);
    for (const author of authors) {
      expect(author.id).toBeTruthy();
      expect(author.name).toBeTruthy();
      expect(typeof author.socials).toBe("object");
    }
  });
});
