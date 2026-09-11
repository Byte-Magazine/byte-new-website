import { describe, it, expect } from "vitest";
import {
  getGraph,
  getAllArticles,
  getArticle,
  getAllIssues,
  getIssue,
  getAllAuthors,
  getAuthor,
  getAllTags,
  getAllBlogPosts,
  getAllWorkshops,
  getWorkshopDoc,
  getStaffSections,
  getCodenameh,
  getRelatedArticles,
  getAdjacentArticles,
  getStats,
} from "./index";

describe("content graph", () => {
  it("loads all 8 issues", () => {
    expect(getAllIssues()).toHaveLength(8);
  });

  it("loads every article", () => {
    expect(getAllArticles()).toHaveLength(94);
  });

  it("sorts issues newest first", () => {
    const issues = getAllIssues();
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i - 1].date >= issues[i].date).toBe(true);
    }
  });

  it("resolves article authors to author objects", () => {
    const withAuthors = getAllArticles().find((a) => a.authors.length > 0)!;
    expect(withAuthors.authors[0].name).toBeTruthy();
    expect(withAuthors.authors[0].url).toMatch(/^\/authors\//);
  });

  it("computes each author's article count at build time", () => {
    const author = getAllAuthors().find((a) => a.articleCount > 0)!;
    expect(author.articles).toHaveLength(author.articleCount);
    for (const article of author.articles) {
      expect(article.authors.some((x) => x.id === author.id)).toBe(true);
    }
  });

  it("assigns every article to an issue and back", () => {
    for (const issue of getAllIssues()) {
      expect(issue.articleCount).toBe(issue.articles.length);
      for (const article of issue.articles) {
        expect(article.issue.number).toBe(issue.number);
      }
    }
  });

  it("accounts for every article in exactly one issue", () => {
    const total = getAllIssues().reduce((n, i) => n + i.articleCount, 0);
    expect(total).toBe(getAllArticles().length);
  });

  it("orders articles within an issue by their order field", () => {
    for (const issue of getAllIssues()) {
      const orders = issue.articles.map((a) => a.order);
      expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    }
  });

  it("builds tags with correct counts", () => {
    for (const tag of getAllTags()) {
      expect(tag.count).toBe(tag.articles.length + tag.blogPosts.length);
      expect(tag.count).toBeGreaterThan(0);
    }
  });

  it("gives every article a reading time of at least one minute", () => {
    for (const article of getAllArticles()) {
      expect(article.readingTime).toBeGreaterThanOrEqual(1);
    }
  });

  it("builds legacy-compatible article URLs", () => {
    for (const article of getAllArticles()) {
      expect(article.url).toMatch(/^\/mags\/[01]{8}\/[^/]+$/);
    }
  });

  it("builds legacy-compatible issue URLs", () => {
    for (const issue of getAllIssues()) {
      expect(issue.url).toMatch(/^\/mags\/[01]{8}$/);
    }
  });

  it("points every issue at its PDF on the CDN", () => {
    for (const issue of getAllIssues()) {
      expect(issue.pdfUrl).toContain(`/mags/${issue.number}.pdf`);
    }
  });

  it("looks an article up by issue and slug", () => {
    const article = getAllArticles()[0];
    expect(getArticle(article.issueNumber, article.slug)).toBe(article);
  });

  it("looks an issue up by number", () => {
    expect(getIssue("00000101")?.number).toBe("00000101");
  });

  it("returns related articles that share a tag and exclude the article itself", () => {
    const article = getAllArticles().find((a) => a.tags.length > 0)!;
    const related = getRelatedArticles(article, 3);
    expect(related.length).toBeLessThanOrEqual(3);
    for (const r of related) expect(r.url).not.toBe(article.url);
  });

  it("returns adjacent articles within the same issue", () => {
    const issue = getAllIssues().find((i) => i.articles.length > 2)!;
    const middle = issue.articles[1];
    const { prev, next } = getAdjacentArticles(middle);
    expect(prev?.url).toBe(issue.articles[0].url);
    expect(next?.url).toBe(issue.articles[2].url);
  });

  it("returns no prev for the first article in an issue", () => {
    const issue = getAllIssues().find((i) => i.articles.length > 1)!;
    expect(getAdjacentArticles(issue.articles[0]).prev).toBeUndefined();
  });

  it("loads blog posts, workshops, staff, and codenameh", () => {
    expect(getAllBlogPosts()).toHaveLength(2);
    expect(getAllWorkshops()).toHaveLength(1);
    expect(getAllWorkshops()[0].docs.length).toBe(6);
    expect(getStaffSections()).toHaveLength(5);
    expect(getCodenameh()).toHaveLength(13);
  });

  it("orders workshop docs by their order field", () => {
    for (const workshop of getAllWorkshops()) {
      const orders = workshop.docs.map((d) => d.order);
      expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    }
  });

  it("looks up a workshop doc by workshop and slug", () => {
    const doc = getAllWorkshops()[0].docs[0];
    expect(getWorkshopDoc(doc.workshop, doc.slug)).toBe(doc);
  });

  it("computes stats from the graph", () => {
    const stats = getStats();
    expect(stats.issues).toBe(8);
    expect(stats.articles).toBe(getAllArticles().length);
    expect(stats.authors).toBe(getAllAuthors().length);
    expect(stats.codenameh).toBe(13);
  });

  it("sorts authors by article count, then photo, then entry year", () => {
    const authors = getAllAuthors();
    for (let i = 1; i < authors.length; i++) {
      const prev = authors[i - 1];
      const curr = authors[i];
      if (prev.articleCount !== curr.articleCount) {
        expect(prev.articleCount).toBeGreaterThan(curr.articleCount);
        continue;
      }
      const prevPhoto = Boolean(prev.image);
      const currPhoto = Boolean(curr.image);
      if (prevPhoto !== currPhoto) {
        expect(prevPhoto).toBe(true);
        continue;
      }
      const prevYear = Boolean(
        prev.title && /[۰-۹]{4}|[12]\d{3}/.test(prev.title),
      );
      const currYear = Boolean(
        curr.title && /[۰-۹]{4}|[12]\d{3}/.test(curr.title),
      );
      if (prevYear !== currYear) {
        expect(prevYear).toBe(true);
      }
    }
  });

  it("strips the placeholder author avatar", () => {
    const bare = getAuthor("FatemeHarirforoush");
    expect(bare).toBeTruthy();
    expect(bare!.image).toBeUndefined();
    expect(bare!.title).toBeUndefined();
  });

  it("credits AuthorCallout authors when frontmatter authors is empty", () => {
    const ravan = getAuthor("AmirHosseinRavanNakhjavani");
    expect(ravan).toBeTruthy();
    expect(ravan!.articleCount).toBeGreaterThan(0);
    expect(ravan!.image).toBeTruthy();

    const hasan = getAuthor("AmirHosseinHasanZadeh")!;
    // Same contribution volume, but Hasan has no photo — photo ranks first.
    expect(hasan.articleCount).toBe(1);
    expect(hasan.image).toBeUndefined();
    if (ravan!.articleCount === hasan.articleCount) {
      const authors = getAllAuthors();
      expect(authors.indexOf(ravan!)).toBeLessThan(authors.indexOf(hasan));
    }
  });

  it("marks authors who appear in the staff list", () => {
    const staffAuthors = getAllAuthors().filter((a) => a.isStaff);
    expect(staffAuthors.length).toBeGreaterThan(0);
    for (const author of staffAuthors) {
      expect(author.staffSections.length).toBeGreaterThan(0);
    }
  });

  it("gives every staff member a linked author profile", () => {
    for (const section of getStaffSections()) {
      for (const member of section.members) {
        const author = getAuthor(member.authorId);
        expect(author, member.name).toBeDefined();
        expect(author!.url).toBe(`/authors/${member.authorId}`);
      }
    }
  });

  it("memoizes the graph", () => {
    expect(getGraph()).toBe(getGraph());
  });

  it("finds an author by id", () => {
    const first = getAllAuthors()[0];
    expect(getAuthor(first.id)).toBe(first);
  });

  it("gives every article a non-empty body", () => {
    for (const article of getAllArticles()) {
      expect(article.body.length).toBeGreaterThan(0);
    }
  });
});
