import Image from "next/image";

import { cn } from "@/lib/utils";

interface MdxImageProps {
  src?: string;
  alt?: string;
  title?: string;
  /** Public path the article's co-located images were copied to. */
  baseUrl?: string;
  className?: string;
}

/** Resolves a co-located `./img/x.png` reference against the article's assets. */
export function resolveMdxSrc(src: string, baseUrl?: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  const clean = src.replace(/^\.\//, "");
  return baseUrl ? `${baseUrl}/${clean}` : `/${clean}`;
}

/**
 * Always wrap in <figure> so markdown images are block-level.
 * Instant View rejects <img> nested inside <p>.
 */
export function MdxImage({
  src,
  alt,
  title,
  baseUrl,
  className,
}: MdxImageProps) {
  if (!src) return null;
  const resolved = resolveMdxSrc(src, baseUrl);

  return (
    <figure className="my-6">
      <Image
        src={resolved}
        alt={alt ?? ""}
        width={1200}
        height={800}
        unoptimized
        className={cn("h-auto w-full rounded-lg border", className)}
      />
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  );
}

export default MdxImage;
