import { useEffect, useRef } from 'react';

/** A long pause (hidden tab, breakpoint) must not turn into one huge jump */
const MAX_DELTA_MS = 100;

/**
 * Calls `callback(deltaMs)` on every animation frame while `active` is true.
 * deltaMs is the real time since the previous frame.
 */
export function useAnimationFrame(
  callback: (deltaMs: number) => void,
  active: boolean
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last !== null)
        callbackRef.current(Math.min(now - last, MAX_DELTA_MS));
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
