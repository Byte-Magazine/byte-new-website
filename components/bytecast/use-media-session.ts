"use client";

import { useEffect, type RefObject } from "react";

interface Options {
  title: string;
  artist: string;
  album: string;
  artwork: { src: string; sizes: string; type: string }[];
  playing: boolean;
  duration: number;
  rate: number;
  onPlay: () => void;
  onPause: () => void;
  onSeekTo: (time: number) => void;
  onSkip: (delta: number) => void;
  onChapter: (direction: -1 | 1) => void;
}

/**
 * Lock-screen / headset / notification-shade controls and metadata. Position
 * is read from the element on demand so it needs no per-frame updates.
 */
export function useMediaSession(
  audioRef: RefObject<HTMLAudioElement | null>,
  o: Options,
) {
  const { title, artist, album, artwork } = o;
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork,
    });
  }, [title, artist, album, artwork]);

  const { onPlay, onPause, onSeekTo, onSkip, onChapter } = o;
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", onPlay],
      ["pause", onPause],
      ["seekbackward", (d) => onSkip(-(d.seekOffset ?? 15))],
      ["seekforward", (d) => onSkip(d.seekOffset ?? 15)],
      ["seekto", (d) => d.seekTime !== undefined && onSeekTo(d.seekTime)],
      ["previoustrack", () => onChapter(-1)],
      ["nexttrack", () => onChapter(1)],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Not every browser implements every action.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // See above.
        }
      }
    };
  }, [onPlay, onPause, onSeekTo, onSkip, onChapter]);

  const { playing, duration, rate } = o;
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: rate,
        position: Math.min(audio.currentTime, duration),
      });
    } catch {
      // Throws on out-of-range values while metadata is still loading.
    }
  }, [audioRef, playing, duration, rate]);
}
