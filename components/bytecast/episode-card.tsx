import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import type { Episode } from "@/lib/bytecast";
import { durationLabel, episodeLabel } from "@/lib/bytecast/labels";
import { formatJalaliLong } from "@/lib/persian";

import { EpisodePeople } from "./episode-people";

/** An episode as a card: cover, title, who talks, and a link to listen. */
export function EpisodeCard({
  episode,
  priority = false,
}: {
  episode: Episode;
  priority?: boolean;
}) {
  return (
    <article className="flex flex-col gap-5 rounded-xl border bg-card p-5 sm:flex-row">
      <Link
        href={episode.url}
        tabIndex={-1}
        aria-hidden
        className="relative mx-auto block aspect-square w-full max-w-60 shrink-0 self-start overflow-hidden rounded-lg border sm:mx-0 sm:w-40"
      >
        <Image
          src={episode.cover}
          alt=""
          fill
          unoptimized
          priority={priority}
          sizes="(min-width: 640px) 160px, 240px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">
          {episodeLabel(episode.number)} · {formatJalaliLong(episode.date)} ·{" "}
          {durationLabel(episode.audio.duration)}
        </p>
        <h3 className="mt-1 text-xl font-black leading-9">
          <Link href={episode.url} className="hover:text-accent">
            {episode.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
          {episode.description}
        </p>
        <EpisodePeople
          guest={episode.guest}
          host={episode.host}
          className="mt-4"
        />
        <Link
          href={episode.url}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Play className="size-4 fill-current" />
          شنیدن قسمت
        </Link>
      </div>
    </article>
  );
}
