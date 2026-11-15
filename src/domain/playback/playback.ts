const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/** How much mission time passes per second of real time: 1 hour, 6 hours, 1 day. */
export const PLAYBACK_SPEEDS = [HOUR_MS, 6 * HOUR_MS, DAY_MS] as const;
export const DEFAULT_PLAYBACK_SPEED = 6 * HOUR_MS;

export interface PlaybackStep {
  offsetMs: number;
  /** The end of the mission is reached and playback is not looped */
  ended: boolean;
}

/**
 * Moves the playback position forward.
 * `speed` is mission milliseconds per real second, `deltaMs` is real milliseconds.
 * At the end the position either stops (ended) or wraps around to the start (loop).
 */
export function advancePlayback(
  offsetMs: number,
  deltaMs: number,
  speed: number,
  durationMs: number,
  loop: boolean
): PlaybackStep {
  if (durationMs <= 0) return { offsetMs: 0, ended: true };
  const next = offsetMs + (Math.max(0, deltaMs) / 1000) * speed;
  if (next < durationMs) return { offsetMs: Math.max(0, next), ended: false };
  if (loop) return { offsetMs: next % durationMs, ended: false };
  return { offsetMs: durationMs, ended: true };
}

/** Keeps a position inside the mission */
export function clampOffset(offsetMs: number, durationMs: number): number {
  return Math.min(Math.max(0, offsetMs), Math.max(0, durationMs));
}
