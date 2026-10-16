"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2, 0.75] as const;

/** Anything shorter than this is a mis-click, not a place worth resuming. */
const RESUME_MIN = 5;
/** Don't offer to resume a listener who had practically finished. */
const RESUME_TAIL = 15;
const SAVE_EVERY = 5;

export interface PlayerState {
  status: "idle" | "loading" | "ready" | "error";
  playing: boolean;
  /** Playing was requested but the data hasn't caught up (stall or seek). */
  buffering: boolean;
  ended: boolean;
  /** Whole seconds; changes at most once a second, so renders stay rare. */
  time: number;
  duration: number;
  rate: number;
  /** Position found in storage that playback will continue from. */
  resumeFrom: number | null;
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: resuming is a nicety, not a need.
  }
}

/** `?t=87` or `?t=1m27s` from the page address, as seconds. */
function timeFromUrl(): number | null {
  const raw = new URLSearchParams(window.location.search).get("t");
  if (!raw) return null;
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s?)?$/);
  if (!match || !match[0]) return null;
  const [, h = "0", m = "0", s = "0"] = match;
  const seconds = Number(h) * 3600 + Number(m) * 60 + Number(s);
  return Number.isFinite(seconds) ? seconds : null;
}

/**
 * Drives one <audio> element: play state, seeking, rate, buffering and
 * resume. The element streams straight from storage with HTTP range
 * requests; `preload="none"` keeps the page free of audio traffic until the
 * listener shows intent (hover/focus warms the metadata, play fetches).
 *
 * Seeks requested before the file's metadata is available are queued and
 * applied on `loadedmetadata`, so chapters can be clicked on a cold page.
 *
 * State only changes on events and at most once per second, on purpose: the
 * player must stay cheap on old phones.
 */
export function useAudioPlayer(
  audioRef: RefObject<HTMLAudioElement | null>,
  { slug, duration: knownDuration }: { slug: string; duration: number },
) {
  const [state, setState] = useState<PlayerState>({
    status: "idle",
    playing: false,
    buffering: false,
    ended: false,
    time: 0,
    duration: knownDuration,
    rate: 1,
    resumeFrom: null,
  });

  const pendingSeek = useRef<number | null>(null);
  const durationRef = useRef(knownDuration);
  const lastSaved = useRef(0);
  const storageKey = `bytecast:${slug}:position`;

  /** Merges a change, returning the same object (no render) if nothing differs. */
  const patch = useCallback((next: Partial<PlayerState>) => {
    setState((current) => {
      const changed = (Object.keys(next) as (keyof PlayerState)[]).some(
        (key) => current[key] !== next[key],
      );
      return changed ? { ...current, ...next } : current;
    });
  }, []);

  const maxTime = useCallback(() => {
    const real = audioRef.current?.duration;
    return real && Number.isFinite(real) ? real : durationRef.current;
  }, [audioRef]);

  /** Ask the browser to fetch metadata (and nothing more) ahead of a play. */
  const warm = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.readyState === 0 && audio.preload === "none") {
      audio.preload = "metadata";
    }
  }, [audioRef]);

  const seek = useCallback(
    (to: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const target = Math.min(Math.max(0, to), maxTime());
      if (audio.readyState === 0) {
        pendingSeek.current = target;
        warm();
      } else {
        audio.currentTime = target;
      }
      patch({ time: Math.floor(target), ended: false });
    },
    [audioRef, maxTime, patch, warm],
  );

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.error) audio.load();
    if (audio.readyState === 0) patch({ status: "loading" });
    try {
      await audio.play();
    } catch (error) {
      // A pause() or new load() interrupting play() is normal, not a failure.
      if ((error as DOMException).name !== "AbortError") {
        patch({ playing: false, buffering: false });
      }
    }
  }, [audioRef, patch]);

  const pause = useCallback(() => audioRef.current?.pause(), [audioRef]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void play();
    else audio.pause();
  }, [audioRef, play]);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek((pendingSeek.current ?? audio.currentTime) + delta);
    },
    [audioRef, seek],
  );

  const setRate = useCallback(
    (rate: number) => {
      const audio = audioRef.current;
      if (audio) audio.playbackRate = rate;
      patch({ rate });
    },
    [audioRef, patch],
  );

  const retry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    pendingSeek.current ??= audio.currentTime || null;
    patch({ status: "loading" });
    audio.load();
    void play();
  }, [audioRef, patch, play]);

  // Restore an explicit ?t= time, or the last listening position.
  useEffect(() => {
    const fromUrl = timeFromUrl();
    const saved = Number(readStored(storageKey));
    let start: number | null = null;
    let resume: number | null = null;
    if (fromUrl !== null && fromUrl >= 0 && fromUrl < durationRef.current) {
      start = fromUrl;
    } else if (
      Number.isFinite(saved) &&
      saved > RESUME_MIN &&
      saved < durationRef.current - RESUME_TAIL
    ) {
      start = saved;
      resume = saved;
    }
    if (start !== null) {
      pendingSeek.current = start;
      patch({ time: Math.floor(start), resumeFrom: resume });
    }
  }, [patch, storageKey]);

  // Mirror the element's events into state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        durationRef.current = audio.duration;
        patch({ duration: audio.duration });
      }
    };
    const save = (time: number, force = false) => {
      if (!force && Math.abs(time - lastSaved.current) < SAVE_EVERY) return;
      lastSaved.current = time;
      writeStored(
        storageKey,
        time > RESUME_MIN ? String(Math.floor(time)) : null,
      );
    };

    const on: Record<string, () => void> = {
      loadstart: () => patch({ status: "loading" }),
      loadedmetadata: () => {
        syncDuration();
        if (pendingSeek.current !== null) {
          audio.currentTime = Math.min(pendingSeek.current, maxTime());
          pendingSeek.current = null;
        }
      },
      durationchange: syncDuration,
      canplay: () => patch({ status: "ready", buffering: false }),
      play: () => {
        // Playing: now buffer the whole file (9 MB), so chapter jumps and
        // seeks are served from memory instead of a new range request.
        audio.preload = "auto";
        patch({ playing: true, ended: false, resumeFrom: null });
      },
      playing: () =>
        patch({ playing: true, buffering: false, status: "ready" }),
      pause: () => {
        patch({ playing: false, buffering: false });
        save(audio.currentTime, true);
      },
      waiting: () => patch({ buffering: true }),
      seeking: () => {
        if (!audio.paused) patch({ buffering: true });
      },
      seeked: () => patch({ buffering: false }),
      timeupdate: () => {
        if (pendingSeek.current === null) {
          patch({ time: Math.floor(audio.currentTime) });
          save(audio.currentTime);
        }
      },
      ratechange: () => patch({ rate: audio.playbackRate }),
      ended: () => {
        patch({ playing: false, ended: true, buffering: false });
        writeStored(storageKey, null);
      },
      error: () => patch({ status: "error", playing: false, buffering: false }),
    };

    for (const [name, handler] of Object.entries(on)) {
      audio.addEventListener(name, handler);
    }
    // Leaving the page mid-sentence should not lose the place.
    const onHide = () => save(audio.currentTime, true);
    window.addEventListener("pagehide", onHide);
    return () => {
      for (const [name, handler] of Object.entries(on)) {
        audio.removeEventListener(name, handler);
      }
      window.removeEventListener("pagehide", onHide);
    };
  }, [audioRef, maxTime, patch, storageKey]);

  return { state, play, pause, toggle, seek, skip, setRate, retry, warm };
}
