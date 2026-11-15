import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { sunElevationStats } from '@/domain/metrics/sunElevation/sunElevation';

const HOUR = 3_600_000;

const ephemerisOf = (sun: number[]): Ephemeris => ({
  startMs: 0,
  stepMs: HOUR,
  sun: { az: sun.map(() => 90), el: sun },
  earth: { az: sun.map(() => 180), el: sun.map(() => 10) },
});

describe('sunElevationStats', () => {
  it('finds the highest Sun and the average while it is visible', () => {
    const ephemeris = ephemerisOf([-2, 1, 3, 2, -1]);
    expect(sunElevationStats(ephemeris, ephemeris, 0, 4 * HOUR)).toEqual({
      max: 3,
      meanLit: 2,
    });
  });

  it('counts only the samples inside the mission', () => {
    const ephemeris = ephemerisOf([10, 1, 2, 10]);
    expect(sunElevationStats(ephemeris, ephemeris, HOUR, 2 * HOUR)?.max).toBe(
      2
    );
  });

  it('uses the terrain mask to decide when the Sun is visible', () => {
    const ephemeris = ephemerisOf([2, 4]);
    // Behind a mountain at the first sample
    const visible = ephemerisOf([-1, 2]);
    expect(sunElevationStats(ephemeris, visible, 0, HOUR)?.meanLit).toBe(4);
  });

  it('has no average if the Sun is never visible', () => {
    const ephemeris = ephemerisOf([-3, -1]);
    expect(sunElevationStats(ephemeris, ephemeris, 0, HOUR)).toEqual({
      max: -1,
      meanLit: null,
    });
  });

  it('returns null if no sample falls into the mission', () => {
    const ephemeris = ephemerisOf([1, 2]);
    expect(
      sunElevationStats(ephemeris, ephemeris, 5 * HOUR, 6 * HOUR)
    ).toBeNull();
  });
});
