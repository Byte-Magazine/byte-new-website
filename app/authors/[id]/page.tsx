import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/cards/article-card";
import { SocialLinks } from "@/components/cards/person-card";
import { MetaLine } from "@/components/content/meta-line";
import { getAllAuthors, getAuthor } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { buildMetadata, JsonLd, personJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ id: author.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) return {};

  return buildMetadata({
    title: author.name,
    description: `${author.name}${author.title ? `، ${author.title}` : ""} — ${toPersianDigits(author.articleCount)} مطلب در نشریه‌ی بایت`,
    path: author.url,
    image: author.image,
    type: "profile",
  });
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = getAuthor(id);
  if (!author) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd
        data={personJsonLd({
          name: author.name,
          url: author.url,
          image: author.image,
          jobTitle: author.title,
          sameAs: Object.values(author.socials).filter(Boolean) as string[],
        })}
      />

      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/authors" className="hover:text-foreground">
          نویسندگان
        </Link>
      </nav>

      <header className="mb-12 flex flex-wrap items-center gap-6">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-full border bg-muted">
          {author.image ? (
            <Image
              src={author.image}
              alt=""
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl text-muted-foreground/50">
              {author.name.slice(0, 1)}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-black">{author.name}</h1>
          <MetaLine
            className="mt-2"
            items={[
              author.title,
              author.articleCount > 0
                ? `${toPersianDigits(author.articleCount)} مطلب`
                : null,
              author.isStaff ? author.staffSections.join("، ") : null,
            ]}
          />
          <SocialLinks socials={author.socials} className="mt-3" />
        </div>
      </header>

      {author.articles.length > 0 ? (
        <section>
          <h2 className="mb-6 text-xl font-bold">مطالب</h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {author.articles.map((article) => (
              <li key={article.url}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {author.blogPosts.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-6 text-xl font-bold">وبلاگ</h2>
          <ul className="divide-y border-y">
            {author.blogPosts.map((post) => (
              <li key={post.url}>
                <Link
                  href={post.url}
                  className="group block py-4 transition-colors hover:bg-muted/40"
                >
                  <span className="block font-bold leading-8 group-hover:underline">
                    {post.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatJalali(post.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {author.articles.length === 0 && author.blogPosts.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          هنوز مطلبی از این نویسنده منتشر نشده است.
        </p>
      ) : null}
    </main>
  );
}
