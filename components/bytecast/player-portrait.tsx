import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A person in a ring. The one speaking is full size with a ring that pulses
 * outward; the other is dimmed and slightly smaller.
 */
export function PlayerPortrait({
  name,
  role,
  image,
  href,
  active,
  pulsing,
}: {
  name: string;
  role: string;
  image?: string;
  /** The person's author profile. */
  href: string;
  active: boolean;
  /** Playing right now, so the active ring pulses. */
  pulsing: boolean;
}) {
  return (
    <figure className="mx-auto flex w-full max-w-40 flex-col items-center gap-3 text-center">
      <div
        className={cn(
          "relative aspect-square w-full transition-[transform,opacity] duration-300",
          active ? "scale-100 opacity-100" : "scale-[0.94] opacity-60",
        )}
      >
        <span
          className={cn(
            "absolute -inset-1.5 rounded-full border-2 transition-colors duration-300",
            active ? "border-accent" : "border-border",
          )}
          aria-hidden
        />
        {active && pulsing ? (
          <span
            className="bc-pulse absolute -inset-1.5 rounded-full border-2 border-accent"
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 overflow-hidden rounded-full bg-muted">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              unoptimized
              sizes="160px"
              className="object-cover"
            />
          ) : null}
        </div>
      </div>
      <figcaption className="min-w-0 max-w-full">
        <Link
          href={href}
          className="block text-sm font-bold leading-6 hover:text-accent md:text-base"
        >
          {name}
        </Link>
        <span className="line-clamp-2 block text-xs leading-5 text-muted-foreground">
          {role}
        </span>
      </figcaption>
    </figure>
  );
}
