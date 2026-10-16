import type { Metadata } from "next";

import { BytecastHero } from "@/components/bytecast/bytecast-hero";
import { EpisodeCard } from "@/components/bytecast/episode-card";
import {
  getLatestEpisode,
  getSeasonEpisodes,
  SEASONS,
  SHOW,
} from "@/lib/bytecast";
import { buildMetadata, JsonLd, podcastSeriesJsonLd } from "@/lib/seo";

const FEED = "/bytecast/feed.xml";
const cover = getLatestEpisode()?.cover ?? "";

export const metadata: Metadata = (() => {
  const base = buildMetadata({
    title: `${SHOW.name}، پادکست بایت`,
    description: SHOW.description,
    path: "/bytecast",
    image: cover,
  });
  return {
    ...base,
    alternates: { ...base.alternates, types: { "application/rss+xml": FEED } },
  };
})();

export default function BytecastPage() {
  return (
    <main>
      <JsonLd
        data={podcastSeriesJsonLd({
          name: `${SHOW.name} (${SHOW.latinName})`,
          description: SHOW.description,
          url: "/bytecast",
          image: cover,
          feedUrl: FEED,
        })}
      />

      <BytecastHero feedUrl={FEED} />

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        {SEASONS.map((season) => (
          <section
            key={season.number}
            aria-labelledby={`season-${season.number}`}
          >
            <h2 id={`season-${season.number}`} className="text-xl font-bold">
              {season.title}
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">
              {season.tagline}
            </p>
            <ul className="grid gap-6 lg:grid-cols-2">
              {getSeasonEpisodes(season.number).map((episode, i) => (
                <li key={episode.slug}>
                  <EpisodeCard episode={episode} priority={i === 0} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
