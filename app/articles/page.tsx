import type { Metadata } from "next";

import {
  ArticleBrowser,
  type BrowserArticle,
} from "@/components/articles/article-browser";
import {
  getAllArticles,
  getAllAuthors,
  getAllIssues,
  getAllTags,
} from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "مقاله‌ها",
  description:
    "همهٔ مطالب منتشرشده در نشریه‌ی بایت، با امکان جست‌وجو و فیلتر بر اساس برچسب، نویسنده و شماره",
  path: "/articles",
});

export default function ArticlesPage() {
  const articles = getAllArticles();

  /**
   * Everything the browser needs is prepared here, at build time: the Jalali
   * date strings, the cover URLs, and every facet count.
   */
  const items: BrowserArticle[] = articles.map((article) => ({
    url: article.url,
    title: article.title,
    description: article.description,
    date: article.date,
    jalaliDate: formatJalali(article.date),
    readingTime: article.readingTime,
    issueNumber: article.issueNumber,
    themeColor: article.issue.themeColor,
    tags: article.tags,
    authors: article.authors.map((a) => ({
      id: a.id,
      name: a.name,
      image: a.image,
    })),
  }));

  const tags = getAllTags()
    .filter((tag) => tag.articles.length > 0)
    .map((tag) => ({
      value: tag.name,
      label: tag.name,
      count: tag.articles.length,
    }));

  const authors = getAllAuthors()
    .filter((author) => author.articleCount > 0)
    .map((author) => ({
      value: author.id,
      label: author.name,
      count: author.articleCount,
    }));

  const issues = getAllIssues().map((issue) => ({
    value: issue.number,
    label: issue.number,
    count: issue.articleCount,
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-black md:text-4xl">مقاله‌ها</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          {toPersianDigits(articles.length)} مطلب از{" "}
          {toPersianDigits(authors.length)} نویسنده.
        </p>
      </header>

      <ArticleBrowser
        articles={items}
        tags={tags}
        authors={authors}
        issues={issues}
      />
    </main>
  );
}
