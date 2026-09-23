import type { Metadata } from "next";

import { PersonCard } from "@/components/cards/person-card";
import { PROFESSOR_ORDER } from "@/content/data/authors";
import { getAllAuthors } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "نویسندگان",
  description: "نویسندگانی که در نشریه‌ی بایت نوشته‌اند",
  path: "/authors",
});

export default function AuthorsPage() {
  const publishedAuthors = getAllAuthors().filter(
    (author) => author.articleCount > 0,
  );
  const authors = publishedAuthors.filter(
    (author) => author.role !== "professor",
  );
  const professors = publishedAuthors
    .filter((author) => author.role === "professor")
    .sort(
      (a, b) => PROFESSOR_ORDER.indexOf(a.id) - PROFESSOR_ORDER.indexOf(b.id),
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-black md:text-4xl">نویسندگان</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          {toPersianDigits(authors.length)} نفر تا امروز برای بایت نوشته‌اند.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <li key={author.id}>
            <PersonCard
              name={author.name}
              title={author.title}
              image={author.image}
              href={author.url}
              articleCount={author.articleCount}
              socials={author.socials}
              className="h-full"
            />
          </li>
        ))}
      </ul>

      {professors.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-black md:text-3xl">
            اساتید همراه
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {professors.map((author) => (
              <li key={author.id}>
                <PersonCard
                  name={author.name}
                  title={author.title}
                  image={author.image}
                  href={author.url}
                  articleCount={author.articleCount}
                  socials={author.socials}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
