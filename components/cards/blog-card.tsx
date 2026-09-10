import Image from "next/image";
import Link from "next/link";

import type { BlogPost } from "@/lib/content";
import { formatJalali, toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

/**
 * Blog summary. Unlike articles, every post has a real poster image, so the
 * card leads with it.
 */
export function BlogCard({
  post,
  className,
}: {
  post: BlogPost;
  className?: string;
}) {
  return (
    <article className={cn("group h-full", className)}>
      <Link href={post.url} className="flex h-full flex-col">
        <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-xl border bg-muted">
          {post.cover ? (
            <Image
              src={post.cover}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="isolate">
            <time dateTime={post.date}>{formatJalali(post.date)}</time>
          </span>
          <span aria-hidden className="opacity-40">
            ·
          </span>
          <span className="isolate">
            {toPersianDigits(post.readingTime)} دقیقه
          </span>
        </div>

        <h3 className="mt-1.5 text-balance text-lg font-bold leading-8 decoration-accent underline-offset-4 group-hover:underline">
          {post.title}
        </h3>

        {post.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
            {post.description}
          </p>
        ) : null}

        {post.authors.length > 0 ? (
          <p className="mt-auto pt-3 text-xs text-muted-foreground">
            {post.authors.map((a) => a.name).join("، ")}
          </p>
        ) : null}
      </Link>
    </article>
  );
}
