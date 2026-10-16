import { EPISODES, SEASONS, SHOW } from "@/content/data/bytecast";

import { getAuthor } from "../content";
import { podcastAudioUrl } from "../site";
import { episodeRecordSchema, type EpisodeRecord } from "./schema";

export { SEASONS, SHOW };
export * from "./timeline";

export interface EpisodePerson {
  id: string;
  name: string;
  title?: string;
  image?: string;
  url: string;
}

export interface Episode extends EpisodeRecord {
  url: string;
  audioUrl: string;
  host: EpisodePerson;
  guest: EpisodePerson;
}

function person(id: string): EpisodePerson {
  const author = getAuthor(id);
  if (!author) throw new Error(`ByteCast: unknown author "${id}"`);
  return {
    id: author.id,
    name: author.name,
    title: author.title,
    image: author.image,
    url: author.url,
  };
}

let cache: readonly Episode[] | undefined;

/** Canonical page path: `/bytecast/season/1/episode/1`. */
export function episodeUrl(season: number, number: number): string {
  return `/bytecast/season/${season}/episode/${number}`;
}

/** Every episode, validated, newest first. Throws on malformed data at build time. */
export function getAllEpisodes(): readonly Episode[] {
  cache ??= EPISODES.map((record) => {
    const parsed = episodeRecordSchema.parse(record);
    return {
      ...parsed,
      url: episodeUrl(parsed.season, parsed.number),
      audioUrl: podcastAudioUrl(parsed.audio.file),
      host: person(parsed.hostId),
      guest: person(parsed.guestId),
    };
  }).sort((a, b) => b.date.localeCompare(a.date) || b.number - a.number);
  return cache;
}

export function getEpisode(slug: string): Episode | undefined {
  return getAllEpisodes().find((episode) => episode.slug === slug);
}

export function getEpisodeBySeasonAndNumber(
  season: number,
  number: number,
): Episode | undefined {
  return getAllEpisodes().find(
    (episode) => episode.season === season && episode.number === number,
  );
}

export function getLatestEpisode(): Episode | undefined {
  return getAllEpisodes()[0];
}

/** The episodes of one season, in listening order. */
export function getSeasonEpisodes(season: number): Episode[] {
  return getAllEpisodes()
    .filter((episode) => episode.season === season)
    .sort((a, b) => a.number - b.number);
}
