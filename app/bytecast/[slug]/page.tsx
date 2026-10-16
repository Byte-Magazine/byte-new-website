import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodePeople } from "@/components/bytecast/episode-people";
import { EpisodePlayer } from "@/components/bytecast/episode-player";
import { getAllEpisodes, getEpisode, SEASONS, SHOW } from "@/lib/bytecast";
import {
  durationLabel,
  episodeLabel,
  isoDuration,
} from "@/lib/bytecast/labels";
import { toPlayerEpisode } from "@/lib/bytecast/player-data";
import { formatJalaliLong, toPersianDigits } from "@/lib/persian";
import {
  breadcrumbJsonLd,
  buildMetadata,
  JsonLd,
  podcastEpisodeJsonLd,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllEpisodes().map((episode) => ({ slug: episode.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = getEpisode(slug);
  if (!episode) return {};

  const base = buildMetadata({
    title: `${episodeLabel(episode.number)} بایت‌کست: ${episode.title}`,
    description: episode.description,
    path: episode.url,
    image: episode.cover,
  });
  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": "/bytecast/feed.xml" },
    },
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = getEpisode(slug);
  if (!episode) notFound();

  const season = SEASONS.find((s) => s.number === episode.season);
  const siblings = getAllEpisodes().filter((e) => e.slug !== episode.slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: SHOW.name, url: "/bytecast" },
          { name: episode.title, url: episode.url },
        ])}
      />
      <JsonLd
        data={podcastEpisodeJsonLd({
          name: episode.title,
          description: episode.description,
          url: episode.url,
          date: episode.date,
          episodeNumber: episode.number,
          seasonNumber: episode.season,
          duration: isoDuration(episode.audio.duration),
          image: episode.cover,
          audioUrl: episode.audioUrl,
          audioMime: episode.audio.mime,
          audioBytes: episode.audio.bytes,
          series: { name: SHOW.name, url: "/bytecast" },
          people: [episode.guest, episode.host],
        })}
      />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="مسیر">
        <Link href="/bytecast" className="hover:text-foreground">
          {SHOW.name}
        </Link>
      </nav>

      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-bold text-accent">
          {episodeLabel(episode.number)} · {season?.title}
        </p>
        <h1 className="mt-2 text-3xl font-black leading-[1.6] md:text-4xl">
          {episode.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {formatJalaliLong(episode.date)} ·{" "}
          {durationLabel(episode.audio.duration)} ·{" "}
          {toPersianDigits(episode.chapters.length)} بخش
        </p>
      </header>

      <EpisodePlayer episode={toPlayerEpisode(episode)} />

      <div className="mt-12 grid gap-12 md:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="about-episode">
          <h2 id="about-episode" className="text-xl font-bold">
            درباره‌ی این قسمت
          </h2>
          <div className="mt-4 space-y-4 text-lg leading-9 text-muted-foreground">
            {episode.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <div>
            <h2 className="mb-4 text-xl font-bold">گفت‌وگوکنندگان</h2>
            <EpisodePeople
              guest={episode.guest}
              host={episode.host}
              className="flex-col"
            />
          </div>

          {siblings.length > 0 ? (
            <div>
              <h2 className="mb-4 text-xl font-bold">قسمت‌های دیگر</h2>
              <ul className="space-y-2">
                {siblings.map((other) => (
                  <li key={other.slug}>
                    <Link href={other.url} className="hover:text-accent">
                      {episodeLabel(other.number)}: {other.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
