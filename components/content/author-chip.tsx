import Image from "next/image";
import Link from "next/link";

import { getAuthor } from "@/lib/content";
import { cn } from "@/lib/utils";

interface AuthorChipProps {
  id: string;
  className?: string;
}

/**
 * Inline author reference used inside article bodies. Replaces the legacy
 * AuthorCallout, which rendered a name with no link; this one resolves the
 * author from the graph and links to their page.
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

/** Block form used where the legacy content wrote <AuthorCallout>. */
export function AuthorCallout({
  id,
  author,
  authors,
  children,
}: {
  id?: string;
  /** Legacy singular prop used throughout migrated MDX. */
  author?: string;
  authors?: string[];
  children?: React.ReactNode;
}) {
  const ids = authors ?? (id ? [id] : author ? [author] : []);
  if (ids.length === 0) return <>{children}</>;

  return (
    <div className="not-prose my-6 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3">
      <span className="text-sm text-muted-foreground">نوشتهٔ</span>
      {ids.map((authorId) => (
        <AuthorChip key={authorId} id={authorId} />
      ))}
    </div>
  );
}

export default AuthorChip;
