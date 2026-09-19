import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import type { MediaSession } from "zebar";

/** 75 -> "1:15", 3725 -> "1:02:05" */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/**
 * Tracks playback progress for a media session.
 *
 * Zebar only reports the playback position every few seconds, so between
 * updates the position is advanced locally (once per second) while the media
 * is playing. Every time Zebar reports a new position, it re-syncs.
 *
 * Returns undefined values when the media has no known length (live streams,
 * some apps), so the caller can hide the bar.
 */
export function createMediaProgress(
  session: Accessor<MediaSession | null | undefined>,
) {
  const snapshot = createMemo(
    () => {
      const s = session();
      if (!s) {
        return undefined;
      }

      return {
        id: s.sessionId,
        position: s.position - s.startTime,
        duration: s.endTime - s.startTime,
        playing: s.isPlaying,
      };
    },
    undefined,
    {
      equals: (a, b) =>
        a?.id === b?.id &&
        a?.position === b?.position &&
        a?.duration === b?.duration &&
        a?.playing === b?.playing,
    },
  );

  // Remember when the latest position was reported.
  const anchor = createMemo(() => {
    snapshot();
    return Date.now();
  });

  const [now, setNow] = createSignal(Date.now());

  createEffect(() => {
    if (!snapshot()?.playing) {
      return;
    }

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    onCleanup(() => clearInterval(id));
  });

  const duration = createMemo(() => {
    const d = snapshot()?.duration;
    return d !== undefined && d > 0 ? d : undefined;
  });

  const elapsed = createMemo(() => {
    const s = snapshot();
    const d = duration();
    if (!s || d === undefined) {
      return undefined;
    }

    const extra = s.playing ? Math.max(0, (now() - anchor()) / 1000) : 0;
    return Math.min(d, Math.max(0, s.position + extra));
  });

  const progress = createMemo(() => {
    const e = elapsed();
    const d = duration();
    return e !== undefined && d !== undefined ? e / d : undefined;
  });

  const remaining = createMemo(() => {
    const e = elapsed();
    const d = duration();
    return e !== undefined && d !== undefined ? d - e : undefined;
  });

  return { elapsed, duration, progress, remaining };
}
