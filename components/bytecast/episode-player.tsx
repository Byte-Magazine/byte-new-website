"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Link2, RotateCcw } from "lucide-react";

import {
  chapterIndexAt,
  formatClock,
  speakerAt,
  type TimelineChapter,
  type Turn,
} from "@/lib/bytecast/timeline";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

import { ChapterList } from "./chapter-list";
import { PauseIcon, PlayIcon, ReplayIcon, SkipIcon } from "./icons";
import { PlayerPortrait } from "./player-portrait";
import { SeekBar } from "./seek-bar";
import { PLAYBACK_RATES, useAudioPlayer } from "./use-audio-player";
import { useMediaSession } from "./use-media-session";

export interface PlayerPerson {
  name: string;
  role: string;
  image?: string;
  /** Author profile page. */
  href: string;
}

/** Everything the player needs, as plain data a server page can hand over. */
export interface PlayerEpisode {
  slug: string;
  title: string;
  /** `قسمت اول` */
  label: string;
  /** `EP.00000001` */
  code: string;
  seasonTitle: string;
  audioUrl: string;
  duration: number;
  cover: string;
  chapters: TimelineChapter[];
  turns: Turn[];
  voiceOffset: number;
  host: PlayerPerson;
  guest: PlayerPerson;
}

const SKIP = 15;
const BARS = 23;
/**
 * Bars taper toward the portraits, like a bridge between them. Rounded: Math.sin
 * can differ in the last digits between Node and the browser, which React
 * reports as a hydration mismatch on the inline style.
 */
const BAR_HEIGHTS = Array.from({ length: BARS }, (_, i) =>
  Math.round(28 + Math.sin(((i + 0.5) / BARS) * Math.PI) * 72),
);

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

/**
 * The ByteCast episode player.
 *
 * Guest and host face each other; whoever is speaking is lit, the title shows
 * which chapter is playing, and the timeline scrubs and marks chapter starts.
 * Audio streams from storage with range requests and nothing is fetched until
 * the listener acts.
 *
 * Built to be light: React renders about once a second, motion is limited to
 * transforms and opacity (CSS), and there is no canvas, blur or per-frame JS.
 */
export function EpisodePlayer({ episode }: { episode: PlayerEpisode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const player = useAudioPlayer(audioRef, {
    slug: episode.slug,
    duration: episode.duration,
  });
  const { state, seek, skip, play, pause, toggle } = player;
  const duration = state.duration;

  const chapterIndex = chapterIndexAt(episode.chapters, state.time);
  const chapter = episode.chapters[chapterIndex];
  const speaker = speakerAt(episode.turns, state.time, episode.voiceOffset);
  // Jingles and pauses (no speaker) keep both lit.
  const guestActive = speaker !== "host";
  const hostActive = speaker !== "guest";

  // Latest time for callbacks that must not re-subscribe every second.
  const timeRef = useRef(state.time);
  useEffect(() => {
    timeRef.current = state.time;
  }, [state.time]);

  const goToChapter = useCallback(
    (direction: -1 | 1) => {
      const now = timeRef.current;
      const index = chapterIndexAt(episode.chapters, now);
      // "Previous" restarts the current chapter unless it has just begun.
      const target =
        direction === -1
          ? now - episode.chapters[index].at > 3
            ? index
            : Math.max(0, index - 1)
          : Math.min(episode.chapters.length - 1, index + 1);
      seek(episode.chapters[target].at);
    },
    [episode.chapters, seek],
  );

  useMediaSession(audioRef, {
    title: `${episode.label}: ${episode.title}`,
    artist: episode.guest.name,
    album: `بایت‌کست · ${episode.seasonTitle}`,
    artwork: useMemo(
      () => [{ src: episode.cover, sizes: "1400x1400", type: "image/jpeg" }],
      [episode.cover],
    ),
    playing: state.playing,
    duration,
    rate: state.rate,
    onPlay: () => void play(),
    onPause: () => pause(),
    onSeekTo: seek,
    onSkip: skip,
    onChapter: goToChapter,
  });

  const selectChapter = (index: number) => {
    seek(episode.chapters[index].at);
    void play();
  };

  const cycleRate = () => {
    const at = PLAYBACK_RATES.findIndex((rate) => rate === state.rate);
    player.setRate(PLAYBACK_RATES[(at + 1) % PLAYBACK_RATES.length]);
  };

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("t", String(Math.floor(timeRef.current)));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("پیوند این لحظه", url.toString());
    }
  };

  // Keyboard: K plays, J/L jump 10 s, [ ] move between chapters.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(event.target)
      )
        return;
      switch (event.key.toLowerCase()) {
        case "k":
          toggle();
          break;
        case "j":
          skip(-10);
          break;
        case "l":
          skip(10);
          break;
        case "[":
          goToChapter(-1);
          break;
        case "]":
          goToChapter(1);
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, skip, goToChapter]);

  const failed = state.status === "error";
  const waiting =
    state.buffering || (state.status === "loading" && state.playing);
  const remaining = Math.max(0, duration - state.time);

  return (
    <section
      aria-label={`پخش‌کننده‌ی ${episode.label} بایت‌کست`}
      className="rounded-xl border bg-card p-4 md:p-8"
    >
      <audio ref={audioRef} src={episode.audioUrl} preload="none" playsInline />

      <p
        className="flex items-center justify-end gap-2.5 font-mono text-xs text-muted-foreground"
      >
        <span>{episode.code}</span>
        <span>·</span>
        <span className="font-semibold text-foreground">BYTECAST</span>
        <span
          className={cn(
            "size-2 rounded-full bg-accent",
            state.playing ? "" : "opacity-40",
          )}
          aria-hidden
        />
      </p>

      {/* the two voices, facing each other */}
      <div
        dir="ltr"
        className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-3 md:gap-8"
      >
        <PlayerPortrait
          name={episode.host.name}
          role={episode.host.role}
          image={episode.host.image}
          href={episode.host.href}
          active={hostActive}
          pulsing={state.playing}
        />
        <div
          className="flex h-16 items-center justify-center gap-[3px] md:h-24 md:gap-1"
          aria-hidden
        >
          {Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              className="bc-bar h-full w-[3px] rounded-full bg-accent/70 md:w-1"
              style={{
                animationDuration: `${0.7 + ((i * 37) % 9) * 0.09}s`,
                animationDelay: `${-((i * 53) % 10) * 0.11}s`,
                animationPlayState: state.playing ? "running" : "paused",
                maxHeight: `${BAR_HEIGHTS[i]}%`,
              }}
            />
          ))}
        </div>
        <PlayerPortrait
          name={episode.guest.name}
          role={episode.guest.role}
          image={episode.guest.image}
          href={episode.guest.href}
          active={guestActive}
          pulsing={state.playing}
        />
      </div>

      {/* player panel */}
      <div className="mt-8 border-t pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div className="min-w-0">
            <p className="text-sm font-bold text-accent">
              بخش {toPersianDigits(chapterIndex + 1)} از{" "}
              {toPersianDigits(episode.chapters.length)}
            </p>
            {/* Reserved height: a one-line and a three-line title must not move the timeline. */}
            <h2
              key={chapterIndex}
              className="bc-fade mt-1 min-h-24 text-lg font-black leading-8 md:min-h-[5.25rem] md:text-2xl md:leading-[1.7]"
            >
              {chapter?.title ?? episode.title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
          {episode.seasonTitle} · {episode.label}
          </p>
        </div>

        <div dir="ltr" className="mt-4">
          <SeekBar
            duration={duration}
            time={state.time}
            chapters={episode.chapters}
            onSeek={seek}
            onWarm={player.warm}
          />
        </div>

        <div
          dir="ltr"
          className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
        >
          <span className="justify-self-start text-base tabular-nums md:text-xl">
            {formatClock(state.time)}
          </span>

          <div className="flex items-center gap-3 md:gap-8">
            <button
              type="button"
              onClick={() => skip(-SKIP)}
              aria-label={`${toPersianDigits(SKIP)} ثانیه عقب`}
              aria-keyshortcuts="J"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipIcon seconds={SKIP} className="size-9 md:size-11" />
            </button>
            <button
              type="button"
              onClick={toggle}
              onPointerEnter={player.warm}
              onFocus={player.warm}
              aria-label={
                state.playing ? "توقف" : state.ended ? "پخش دوباره" : "پخش"
              }
              aria-keyshortcuts="K"
              className="relative flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 md:size-[4.5rem]"
            >
              {waiting ? (
                <span
                  className="absolute inset-1.5 animate-spin rounded-full border-[3px] border-accent-foreground/25 border-t-accent-foreground"
                  aria-hidden
                />
              ) : null}
              {state.playing ? (
                <PauseIcon className="size-7 md:size-8" />
              ) : state.ended ? (
                <ReplayIcon className="size-7 md:size-8" />
              ) : (
                <PlayIcon className="size-7 md:size-8" />
              )}
            </button>
            <button
              type="button"
              onClick={() => skip(SKIP)}
              aria-label={`${toPersianDigits(SKIP)} ثانیه جلو`}
              aria-keyshortcuts="L"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipIcon seconds={SKIP} flip className="size-9 md:size-11" />
            </button>
          </div>

          <span
            className="justify-self-end text-base tabular-nums text-muted-foreground md:text-xl"
            title="زمان باقی‌مانده"
          >
            −{formatClock(remaining)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t py-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={cycleRate}
              aria-label={`سرعت پخش ${toPersianDigits(state.rate)} برابر؛ برای تغییر بزنید`}
              className="min-w-14 rounded-full border px-3 py-1.5 font-bold tabular-nums hover:border-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {toPersianDigits(state.rate)}×
            </button>
            <button
              type="button"
              onClick={() => goToChapter(-1)}
              aria-keyshortcuts="["
              className="rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              بخش قبل
            </button>
            <button
              type="button"
              onClick={() => goToChapter(1)}
              aria-keyshortcuts="]"
              className="rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              بخش بعد
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Link2 className="size-4" />
              )}
              {copied ? "پیوند کپی شد" : "کپی پیوند این لحظه"}
            </button>
            <a
              href={episode.audioUrl}
              download
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Download className="size-4" />
              دانلود
            </a>
          </div>
        </div>

        <div aria-live="polite">
          {failed ? (
            <div
              role="alert"
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
            >
              <span>
                بارگذاری فایل صوتی ممکن نشد. اتصال اینترنت را بررسی کنید و
                دوباره تلاش کنید.
              </span>
              <button
                type="button"
                onClick={player.retry}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold hover:bg-secondary"
              >
                <RotateCcw className="size-3.5" />
                تلاش دوباره
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t pt-6">
        <ChapterList
          chapters={episode.chapters}
          current={chapterIndex}
          playing={state.playing}
          onSelect={selectChapter}
        />
      </div>
    </section>
  );
}
