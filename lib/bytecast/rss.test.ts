import { describe, expect, it } from "vitest";

import { renderPodcastFeed, type PodcastFeedEpisode } from "./rss";

const episode: PodcastFeedEpisode = {
  title: "گفت‌وگو با <دکتر> & «همکار»",
  description: "توضیح",
  url: "https://byte-mag.ir/bytecast/season/1/episode/1/",
  date: "2026-10-16",
  season: 1,
  number: 1,
  duration: 1300.64,
  audioUrl: "https://cdn.example/ByteCast-E01.mp3",
  audioBytes: 9148404,
  audioMime: "audio/mpeg",
  image: "https://byte-mag.ir/img/bytecast/s01e01-cover.jpg",
  guid: "bytecast-s01e01",
};

const feed = renderPodcastFeed({
  title: "بایت‌کست",
  description: "شرح",
  link: "https://byte-mag.ir/bytecast/",
  selfUrl: "https://byte-mag.ir/bytecast/feed.xml",
  image: "https://byte-mag.ir/img/bytecast/s01e01-cover.jpg",
  author: "نشریه",
  email: "a@b.c",
  language: "fa",
  episodes: [episode],
});

describe("renderPodcastFeed", () => {
  it("declares the podcast namespaces", () => {
    expect(feed).toContain(
      'xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"',
    );
    expect(feed).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
  });

  it("escapes markup in titles", () => {
    expect(feed).toContain("&lt;دکتر&gt; &amp; «همکار»");
    expect(feed).not.toContain("<دکتر>");
  });

  it("gives the enclosure its exact size and type", () => {
    expect(feed).toContain(
      '<enclosure url="https://cdn.example/ByteCast-E01.mp3" length="9148404" type="audio/mpeg"/>',
    );
  });

  it("numbers the episode and rounds the duration", () => {
    expect(feed).toContain("<itunes:season>1</itunes:season>");
    expect(feed).toContain("<itunes:episode>1</itunes:episode>");
    expect(feed).toContain("<itunes:duration>1301</itunes:duration>");
  });

  it("dates the episode in RFC 822", () => {
    expect(feed).toContain("<pubDate>Fri, 16 Oct 2026 12:00:00 GMT</pubDate>");
  });
});
