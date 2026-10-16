import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be ISO format YYYY-MM-DD");

const turn = z.tuple([
  z.number().nonnegative(),
  z.number().positive(),
  z.enum(["host", "guest"]),
]);

export const episodeRecordSchema = z
  .object({
    /** URL segment, `s01e01`. */
    slug: z.string().regex(/^s\d{2}e\d{2}$/),
    season: z.number().int().positive(),
    number: z.number().int().positive(),
    title: z.string().min(1),
    /** One sentence for cards, search results and link previews. */
    description: z.string().min(1),
    /** Longer text for the episode page. */
    summary: z.array(z.string().min(1)).min(1),
    date: isoDate,
    audio: z.object({
      /** File name under the podcast base URL. */
      file: z.string().min(1),
      mime: z.string().default("audio/mpeg"),
      /** Exact size, needed by the RSS enclosure. */
      bytes: z.number().int().positive(),
      /** Seconds, so the UI is right before the file's metadata loads. */
      duration: z.number().positive(),
    }),
    /** Site-relative square cover (one JPEG: site, podcast apps and link previews). */
    cover: z.string().min(1),
    /** Author ids: name, title, photo and profile page all come from content/data/authors.ts. */
    hostId: z.string().min(1),
    guestId: z.string().min(1),
    /** Seconds of jingle before the first word. */
    voiceOffset: z.number().nonnegative(),
    chapters: z
      .array(
        z.object({ at: z.number().nonnegative(), title: z.string().min(1) }),
      )
      .min(1),
    /** Who speaks when, in seconds of the voice track (before `voiceOffset`). */
    turns: z.array(turn),
  })
  .refine(
    (episode) =>
      episode.chapters.every(
        (chapter, i) => i === 0 || chapter.at >= episode.chapters[i - 1].at,
      ),
    { message: "chapters must be sorted by time", path: ["chapters"] },
  )
  .refine(
    (episode) =>
      episode.chapters.every((chapter) => chapter.at <= episode.audio.duration),
    { message: "a chapter starts after the audio ends", path: ["chapters"] },
  );

export type EpisodeRecord = z.infer<typeof episodeRecordSchema>;
