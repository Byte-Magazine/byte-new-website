import Image from "next/image";
import Link from "next/link";

import type { Author } from "@/lib/content";

/** Byline used at the top of articles, blog posts, and workshop docs. */
export function AuthorList({ authors }: { authors: Author[] }) {
  if (authors.length === 0) return null;

  return (
    <ul
      data-iv="authors"
      className="flex flex-wrap items-center gap-x-4 gap-y-2"
    >
      {authors.map((author) => (
        <li key={author.id}>
          <Link
            href={author.url}
            data-iv="author"
            className="flex items-center gap-2 text-sm transition-colors hover:text-issue"
          >
            {author.image ? (
              <Image
                src={author.image}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="size-7 rounded-full border object-cover"
              />
            ) : null}
            <span className="font-medium">{author.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
