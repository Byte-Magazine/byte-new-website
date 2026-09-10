import type { Metadata } from "next";

import { PersonCard } from "@/components/cards/person-card";
import { getAllAuthors } from "@/lib/content";
import { toPersianDigits } from "@/lib/persian";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "نویسندگان",
  description: "نویسندگانی که در نشریه‌ی بایت نوشته‌اند",
  path: "/authors",
});

export default function AuthorsPage() {
  const authors = getAllAuthors();
  const contributors = authors.filter((author) => author.articleCount > 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-black md:text-4xl">نویسندگان</h1>
        <p className="mt-4 text-lg leading-9 text-muted-foreground">
          {toPersianDigits(contributors.length)} نفر تا امروز برای بایت
          نوشته‌اند.
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
    </main>
  );
}
