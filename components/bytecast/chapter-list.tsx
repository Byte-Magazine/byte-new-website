"use client";

import { formatClock, type TimelineChapter } from "@/lib/bytecast/timeline";
import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

/** Three bars that bounce while their chapter is the one playing. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-3.5 w-4 items-end justify-between" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bc-bar h-full w-[3px] origin-bottom rounded-full bg-accent"
          style={{
            animationDuration: `${0.7 + i * 0.17}s`,
            animationDelay: `${i * -0.2}s`,
            animationPlayState: active ? "running" : "paused",
            transform: active ? undefined : "scaleY(0.3)",
          }}
        />
      ))}
    </span>
  );
}

/**
 * All chapters, with the current one marked. Selecting one seeks there and
 * starts playing, which is also how a listener jumps in from a cold page.
 */
export function ChapterList({
  chapters,
  current,
  playing,
  onSelect,
}: {
  chapters: readonly TimelineChapter[];
  current: number;
  playing: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-black">
        فهرست بخش‌ها
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {toPersianDigits(chapters.length)}
        </span>
      </h3>
      <ol className="grid gap-x-6 gap-y-1 md:grid-cols-2">
        {chapters.map((chapter, i) => {
          const active = i === current;
          return (
            <li key={chapter.at + chapter.title}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent-soft text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="flex w-5 shrink-0 justify-center text-xs tabular-nums">
                  {active ? (
                    <Equalizer active={playing} />
                  ) : (
                    toPersianDigits(i + 1)
                  )}
                </span>
                <span className="min-w-0 flex-1 text-sm leading-6">
                  {chapter.title}
                </span>
                <span
                  dir="ltr"
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                >
                  {formatClock(chapter.at)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
