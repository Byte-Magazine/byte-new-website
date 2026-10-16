import Image from "next/image";
import Link from "next/link";

import type { EpisodePerson } from "@/lib/bytecast";
import { cn } from "@/lib/utils";

/**
 * The two people of an episode, guest and host, each linking to their
 * existing author profile (name and photo come from the author record).
 */
export function EpisodePeople({
  guest,
  host,
  className,
}: {
  guest: EpisodePerson;
  host: EpisodePerson;
  className?: string;
}) {
  const people = [
    { person: guest, role: "مهمان" },
    { person: host, role: "مصاحبه‌کننده" },
  ];
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-3", className)}>
      {people.map(({ person, role }) => (
        <li key={person.id}>
          <Link href={person.url} className="group flex items-center gap-3">
            <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
              {person.image ? (
                <Image
                  src={person.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="40px"
                  className="object-cover"
                />
              ) : null}
            </span>
            <span className="min-w-0 leading-6">
              <span className="block text-xs text-muted-foreground">
                {role}
              </span>
              <span className="block text-sm font-bold transition-colors group-hover:text-accent">
                {person.name}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
