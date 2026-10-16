import { escapeXml } from "../feed";

export interface PodcastFeedEpisode {
  title: string;
  description: string;
  url: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  season: number;
  number: number;
  /** Seconds. */
  duration: number;
  audioUrl: string;
  audioBytes: number;
  audioMime: string;
  image: string;
  guid: string;
}

export interface PodcastFeed {
  title: string;
  description: string;
  link: string;
  selfUrl: string;
  image: string;
  author: string;
  email: string;
  language: string;
  episodes: PodcastFeedEpisode[];
}

/** Content dates carry no time of day; noon UTC keeps every timezone on the same day. */
function pubDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

/**
 * Podcast RSS (RSS 2.0 + iTunes tags), accepted by Apple Podcasts, Spotify and
 * the rest. The enclosure points at the same storage URL the web player uses.
 */
export function renderPodcastFeed(feed: PodcastFeed): string {
  const e = escapeXml;
  const items = feed.episodes
    .map(
      (ep) => `    <item>
      <title>${e(ep.title)}</title>
      <link>${e(ep.url)}</link>
      <guid isPermaLink="false">${e(ep.guid)}</guid>
      <pubDate>${pubDate(ep.date)}</pubDate>
      <description>${e(ep.description)}</description>
      <enclosure url="${e(ep.audioUrl)}" length="${ep.audioBytes}" type="${e(ep.audioMime)}"/>
      <itunes:title>${e(ep.title)}</itunes:title>
      <itunes:summary>${e(ep.description)}</itunes:summary>
      <itunes:duration>${Math.round(ep.duration)}</itunes:duration>
      <itunes:season>${ep.season}</itunes:season>
      <itunes:episode>${ep.number}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:image href="${e(ep.image)}"/>
      <itunes:explicit>false</itunes:explicit>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${e(feed.title)}</title>
    <link>${e(feed.link)}</link>
    <atom:link href="${e(feed.selfUrl)}" rel="self" type="application/rss+xml"/>
    <description>${e(feed.description)}</description>
    <language>${e(feed.language)}</language>
    <itunes:author>${e(feed.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${e(feed.author)}</itunes:name>
      <itunes:email>${e(feed.email)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${e(feed.image)}"/>
    <itunes:category text="Education"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${items}
  </channel>
</rss>
`;
}
