import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getAuthor } from "@/lib/content";
import { cn } from "@/lib/utils";

interface AuthorChipProps {
  id: string;
  className?: string;
}

/**
 * Inline author reference used inside article bodies. Resolves the author from
 * the graph and links to their page.
 */
export function AuthorChip({ id, className }: AuthorChipProps) {
  const author = getAuthor(id);
  if (!author) return null;

  return (
    <Link
      href={author.url}
      className={cn(
        "not-prose inline-flex items-center gap-2 rounded-full border bg-card px-2.5 py-1 text-sm no-underline transition-colors hover:bg-muted",
        className,
      )}
    >
      {author.image ? (
        <Image
          src={author.image}
          alt=""
          width={22}
          height={22}
          className="size-[22px] rounded-full object-cover"
        />
      ) : null}
      <span className="font-medium">{author.name}</span>
    </Link>
  );
}

/**
 * Block form used where the legacy content wrote `<AuthorCallout>`.
 * Author chips sit above the body — the MDX children are the actual text.
 */
export function AuthorCallout({
  id,
  author,
  authors,
  headline,
  children,
  className,
}: {
  id?: string;
  /** Legacy singular prop used throughout migrated MDX. */
  author?: string;
  authors?: string[];
  headline?: string;
  children?: ReactNode;
  className?: string;
}) {
  const ids = authors ?? (id ? [id] : author ? [author] : []);
  if (ids.length === 0) return <>{children}</>;

  return (
    <aside
      className={cn(
        "my-6 rounded-lg border bg-muted/40 px-4 py-4 sm:px-5",
        className,
      )}
    >
      <div className="not-prose mb-3 flex flex-wrap items-center gap-2">
        {headline ? (
          <p className="w-full text-xs font-semibold tracking-wide text-primary">
            {headline}
          </p>
        ) : null}
        <span className="text-sm text-muted-foreground">نوشتهٔ</span>
        {ids.map((authorId) => (
          <AuthorChip key={authorId} id={authorId} />
        ))}
      </div>
      {children ? (
        <div className="text-[0.97rem] leading-[1.9] text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      ) : null}
    </aside>
  );
}

export default AuthorChip;
