import type { PlayerEpisode } from "@/components/bytecast/episode-player";

import { SEASONS, type Episode } from "./index";
import { episodeCode, episodeLabel } from "./labels";

/** The slice of an episode the (client-side) player needs, as plain data. */
export function toPlayerEpisode(episode: Episode): PlayerEpisode {
  const season = SEASONS.find((s) => s.number === episode.season);
  return {
    slug: episode.slug,
    title: episode.title,
    label: episodeLabel(episode.number),
    code: episodeCode(episode.number),
    seasonTitle: season?.title ?? `فصل ${episode.season}`,
    audioUrl: episode.audioUrl,
    duration: episode.audio.duration,
    cover: episode.cover,
    chapters: episode.chapters,
    turns: episode.turns,
    voiceOffset: episode.voiceOffset,
    host: {
      name: episode.host.name,
      role: episode.host.title ?? "مصاحبه‌کننده",
      image: episode.host.image,
      href: episode.host.url,
    },
    guest: {
      name: episode.guest.name,
      role: episode.guest.title ?? "مهمان",
      image: episode.guest.image,
      href: episode.guest.url,
    },
  };
}
