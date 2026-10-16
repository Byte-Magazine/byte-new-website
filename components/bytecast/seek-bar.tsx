"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import {
  chapterIndexAt,
  formatClock,
  type TimelineChapter,
} from "@/lib/bytecast/timeline";

interface Props {
  duration: number;
  /** Whole seconds, updated about once a second. */
  time: number;
  chapters: readonly TimelineChapter[];
  onSeek: (time: number) => void;
  onWarm: () => void;
}

const TOOLTIP_HALF = 84;

/**
 * The timeline: a progress track with chapter marks, a hover preview and
 * drag-to-scrub. Left to right, like every media player.
 *
 * The fill is a transform (no layout or paint per update) that eases linearly
 * between the once-a-second time updates. Dragging only previews; the seek is
 * issued once on release so the browser makes one range request, not one per
 * pixel.
 */
export function SeekBar({ duration, time, chapters, onSeek, onWarm }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ time: number; x: number } | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);

  const locate = (event: PointerEvent) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width);
    const half = Math.min(TOOLTIP_HALF, rect.width / 2);
    return {
      time: (x / rect.width) * duration,
      x: Math.min(Math.max(x, half), rect.width - half),
    };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const where = locate(event);
    setScrub(where.time);
    setHover(where);
  };

  const onPointerMove = (event: PointerEvent) => {
    const where = locate(event);
    setHover(where);
    if (scrub !== null) setScrub(where.time);
  };

  const finish = (event: PointerEvent, commit: boolean) => {
    if (scrub === null) return;
    setScrub(null);
    if (commit) onSeek(locate(event).time);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 30 : 5;
    const moves: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: 30,
      PageDown: -30,
    };
    if (event.key in moves) onSeek(time + moves[event.key]);
    else if (event.key === "Home") onSeek(0);
    else if (event.key === "End") onSeek(duration);
    else return;
    event.preventDefault();
    event.stopPropagation();
  };

  const shown = scrub ?? time;
  const progress = Math.min(1, Math.max(0, shown / duration));
  const index = chapterIndexAt(chapters, time);
  const hoverChapter = hover
    ? chapters[chapterIndexAt(chapters, hover.time)]
    : null;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label="موقعیت پخش"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${formatClock(time)} از ${formatClock(duration)}${chapters[index] ? `، ${chapters[index].title}` : ""}`}
      className="relative h-9 w-full cursor-pointer touch-none select-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e, true)}
      onPointerCancel={(e) => finish(e, false)}
      onPointerEnter={onWarm}
      onPointerLeave={() => scrub === null && setHover(null)}
      onKeyDown={onKeyDown}
    >
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full origin-left rounded-full bg-accent"
          style={{
            transform: `scaleX(${progress})`,
            transition: scrub === null ? "transform 1s linear" : "none",
          }}
        />
      </div>

      {chapters.slice(1).map((chapter) => (
        <span
          key={chapter.at}
          className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-foreground/30"
          style={{ left: `${(chapter.at / duration) * 100}%` }}
          aria-hidden
        />
      ))}

      <span
        className="pointer-events-none absolute top-1/2 size-4 rounded-full bg-foreground"
        style={{
          left: `${progress * 100}%`,
          transform: "translate(-50%, -50%)",
          transition: scrub === null ? "left 1s linear" : "none",
        }}
        aria-hidden
      />

      {hover ? (
        <div
          className="pointer-events-none absolute -top-11 z-10 w-max max-w-44 rounded-md border bg-popover px-2.5 text-popover-foreground py-1 text-center text-xs leading-5"
          style={{ left: hover.x, transform: "translateX(-50%)" }}
        >
          <span className="tabular-nums">{formatClock(hover.time)}</span>
          {hoverChapter ? (
            <span className="block truncate text-muted-foreground">
              {hoverChapter.title}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
