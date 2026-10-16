import { getAllEpisodes, getLatestEpisode, SHOW } from "@/lib/bytecast";
import { renderPodcastFeed } from "@/lib/bytecast/rss";
import { absoluteUrl, pageUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";

// Required for output: "export" — the feed is generated once at build time.
export const dynamic = "force-static";

export function GET() {
  const xml = renderPodcastFeed({
    title: `${SHOW.name} | ${SITE.shortName}`,
    description: SHOW.description,
    link: pageUrl("/bytecast"),
    selfUrl: absoluteUrl("/bytecast/feed.xml"),
    image: absoluteUrl(getLatestEpisode()?.cover ?? ""),
    author: SITE.name,
    email: SITE.email,
    language: SHOW.language,
    episodes: getAllEpisodes().map((episode) => ({
      title: episode.title,
      description: episode.description,
      url: pageUrl(episode.url),
      date: episode.date,
      season: episode.season,
      number: episode.number,
      duration: episode.audio.duration,
      audioUrl: episode.audioUrl,
      audioBytes: episode.audio.bytes,
      audioMime: episode.audio.mime,
      image: absoluteUrl(episode.cover),
      guid: `bytecast-${episode.slug}`,
    })),
  });
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}
