import { describe, expect, it } from 'vitest';
import { advancePlayback, clampOffset } from '@/domain/playback/playback';

const HOUR = 3_600_000;
const DAY = 86_400_000;

describe('advancePlayback', () => {
  it('moves forward by speed × real time', () => {
    // 1 second at 6 hours per second
    expect(advancePlayback(0, 1000, 6 * HOUR, DAY, false)).toEqual({
      offsetMs: 6 * HOUR,
      ended: false,
    });
    // a half-second frame moves half as far
    expect(advancePlayback(HOUR, 500, 6 * HOUR, DAY, false).offsetMs).toBe(
      4 * HOUR
    );
  });

  it('stops at the end of the mission', () => {
    expect(advancePlayback(23 * HOUR, 1000, 6 * HOUR, DAY, false)).toEqual({
      offsetMs: DAY,
      ended: true,
    });
  });

  it('wraps around when looping', () => {
    const step = advancePlayback(23 * HOUR, 1000, 6 * HOUR, DAY, true);
    expect(step.ended).toBe(false);
    expect(step.offsetMs).toBe(5 * HOUR);
  });

  it('does not move back on a negative or zero frame time', () => {
    expect(advancePlayback(HOUR, -50, DAY, DAY, false).offsetMs).toBe(HOUR);
    expect(advancePlayback(HOUR, 0, DAY, DAY, false).offsetMs).toBe(HOUR);
  });

  it('ends at once for an empty mission', () => {
    expect(advancePlayback(0, 1000, DAY, 0, true)).toEqual({
      offsetMs: 0,
      ended: true,
    });
  });
});

describe('clampOffset', () => {
  it('keeps the position inside the mission', () => {
    expect(clampOffset(-5, DAY)).toBe(0);
    expect(clampOffset(2 * DAY, DAY)).toBe(DAY);
    expect(clampOffset(HOUR, DAY)).toBe(HOUR);
    expect(clampOffset(HOUR, 0)).toBe(0);
  });
});
