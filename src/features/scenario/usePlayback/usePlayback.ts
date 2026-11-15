import { useState } from 'react';
import {
  advancePlayback,
  clampOffset,
  DEFAULT_PLAYBACK_SPEED,
} from '@/domain/playback/playback';
import { useAnimationFrame } from '@/hooks/useAnimationFrame/useAnimationFrame';

interface Position {
  /** The scenario this position belongs to */
  key: string;
  offsetMs: number;
  playing: boolean;
}

export interface Playback {
  /** Mission time passed since the start, ms */
  offsetMs: number;
  playing: boolean;
  /** Mission milliseconds per real second */
  speed: number;
  loop: boolean;
  toggle: () => void;
  pause: () => void;
  /** Jumps to a position inside the mission; playback keeps its state */
  seek: (offsetMs: number) => void;
  /** Back to the start and paused */
  reset: () => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
}

/**
 * The "current moment" inside a mission and its playback.
 * `resetKey` identifies the scenario (site, start, duration): when it changes, the position
 * goes back to the start and playback stops. Speed and loop are kept.
 */
export function usePlayback(durationMs: number, resetKey: string): Playback {
  const fresh: Position = { key: resetKey, offsetMs: 0, playing: false };
  const [position, setPosition] = useState<Position>(fresh);
  const [speed, setSpeed] = useState(DEFAULT_PLAYBACK_SPEED);
  const [loop, setLoop] = useState(false);

  // A position of another scenario is ignored without an effect
  const current = position.key === resetKey ? position : fresh;
  const update = (change: (value: Position) => Position) =>
    setPosition((prev) => change(prev.key === resetKey ? prev : { ...fresh }));

  useAnimationFrame(
    (deltaMs) =>
      update((value) => {
        const step = advancePlayback(
          value.offsetMs,
          deltaMs,
          speed,
          durationMs,
          loop
        );
        return {
          ...value,
          offsetMs: step.offsetMs,
          playing: value.playing && !step.ended,
        };
      }),
    current.playing && durationMs > 0
  );

  return {
    offsetMs: clampOffset(current.offsetMs, durationMs),
    playing: current.playing,
    speed,
    loop,
    toggle: () =>
      update((value) => {
        if (value.playing) return { ...value, playing: false };
        // Play after the end starts the mission again
        const atEnd = value.offsetMs >= durationMs;
        return {
          ...value,
          offsetMs: atEnd ? 0 : value.offsetMs,
          playing: true,
        };
      }),
    pause: () => update((value) => ({ ...value, playing: false })),
    seek: (offsetMs) =>
      update((value) => ({
        ...value,
        offsetMs: clampOffset(offsetMs, durationMs),
      })),
    reset: () => update((value) => ({ ...value, offsetMs: 0, playing: false })),
    setSpeed,
    setLoop,
  };
}
