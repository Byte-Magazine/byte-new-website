/**
 * Pure helpers for ByteCast playback: which chapter / speaker is current,
 * and how to print a time. No DOM or Node APIs, so the player and the build
 * both use them.
 */
import { toPersianDigits } from "../persian";

export type Speaker = "host" | "guest";

/** `[start, end, who]` in seconds, relative to the voice track. */
export type Turn = readonly [number, number, Speaker];

export interface TimelineChapter {
  /** Seconds from the start of the published file. */
  at: number;
  title: string;
}

/**
 * Index of the chapter playing at `time`: the last one whose start has
 * passed (binary search; chapters are sorted). -1 when there are none.
 *
 * The player reports whole seconds, so a chapter starting at 1072.62 is
 * treated as starting at 1072. Otherwise jumping to it would land on 1072 and
 * highlight the previous chapter.
 */
export function chapterIndexAt(
  chapters: readonly TimelineChapter[],
  time: number,
): number {
  if (chapters.length === 0) return -1;
  const t = Number.isFinite(time) ? time : 0;
  let low = 0;
  let high = chapters.length - 1;
  let found = 0;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (Math.floor(chapters[mid].at) <= t) {
      found = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return found;
}

/**
 * Who is talking at `time`. `offset` is how far the voice track starts into
 * the published file (the jingle before it). Null during music and silence.
 */
export function speakerAt(
  turns: readonly Turn[],
  time: number,
  offset = 0,
): Speaker | null {
  const t = time - offset;
  let low = 0;
  let high = turns.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const [start, end, who] = turns[mid];
    if (t < start) high = mid - 1;
    else if (t >= end) low = mid + 1;
    else return who;
  }
  return null;
}

/** `mm:ss`, or `h:mm:ss` past an hour, in Persian digits. */
export function formatClock(seconds: number): string {
  const total =
    Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const two = (n: number) => String(n).padStart(2, "0");
  return toPersianDigits(
    h > 0 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`,
  );
}
