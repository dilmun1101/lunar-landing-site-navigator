import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { defaultCriteria } from '@/domain/criteria/criteria';
import {
  computePlannerValues,
  findBestStart,
} from '@/domain/planner/plannerValues/plannerValues';

const HOUR = 3_600_000;
const DAY = 86_400_000;

/** 10 days, hourly: the Sun is up for the first 5 days, the Earth is always up. */
function makeEphemeris(sunElevation: number): Ephemeris {
  const count = 10 * 24 + 1;
  return {
    startMs: 0,
    stepMs: HOUR,
    sun: {
      az: Array.from({ length: count }, () => 90),
      el: Array.from({ length: count }, (_, index) =>
        index < 5 * 24 ? sunElevation : -5
      ),
    },
    earth: {
      az: Array.from({ length: count }, () => 180),
      el: Array.from({ length: count }, () => 10),
    },
  };
}

describe('computePlannerValues', () => {
  it('counts the share of the mission with the Sun and the Earth', () => {
    const values = computePlannerValues(
      makeEphemeris(5),
      null,
      [0, 5 * DAY],
      2
    );
    expect(values.sunlight).toEqual([100, 0]);
    expect(values.comms).toEqual([100, 100]);
    expect(values.window).toEqual([100, 0]);
  });

  it('hides a body that is below the terrain horizon', () => {
    const terrain = Array.from({ length: 72 }, () => 20);
    const values = computePlannerValues(makeEphemeris(5), terrain, [0], 2);
    expect(values.sunlight).toEqual([0]);
    expect(values.comms).toEqual([0]);
    expect(values.window).toEqual([0]);
  });

  it('shows a body above the terrain horizon', () => {
    const terrain = Array.from({ length: 72 }, () => 3);
    const values = computePlannerValues(makeEphemeris(5), terrain, [0], 2);
    expect(values.sunlight).toEqual([100]);
    expect(values.comms).toEqual([100]);
  });

  it('counts the Sun only above the minimum elevation', () => {
    const criteria = { ...defaultCriteria, minSunElevation: 6 };
    const values = computePlannerValues(
      makeEphemeris(5),
      null,
      [0],
      2,
      criteria
    );
    expect(values.sunlight).toEqual([0]);
    expect(values.comms).toEqual([100]);
    expect(values.window).toEqual([0]);
  });

  it('drops windows shorter than the minimum', () => {
    const short = { ...defaultCriteria, minWindowHours: 72 };
    const long = { ...defaultCriteria, minWindowHours: 24 };
    expect(
      computePlannerValues(makeEphemeris(5), null, [0], 2, short).window
    ).toEqual([0]);
    expect(
      computePlannerValues(makeEphemeris(5), null, [0], 2, long).window
    ).toEqual([100]);
  });

  it('throws if the ephemeris is too short', () => {
    expect(() =>
      computePlannerValues(makeEphemeris(5), null, [9 * DAY], 5)
    ).toThrow();
  });

  it('finds the earliest best start', () => {
    const best = findBestStart(
      makeEphemeris(5),
      null,
      'window',
      2 * DAY,
      8 * DAY,
      2
    );
    expect(best).toEqual({ startMs: 2 * DAY, percent: 100 });
  });

  it('finds the start with the Sun when the range begins in the dark', () => {
    // From day 5 on the Sun is below the horizon, so the best start does not exist
    const best = findBestStart(
      makeEphemeris(5),
      null,
      'sunlight',
      6 * DAY,
      8 * DAY,
      2
    );
    expect(best?.percent).toBe(0);
  });

  it('returns null if the mission does not fit', () => {
    expect(
      findBestStart(makeEphemeris(5), null, 'window', 9 * DAY, 9 * DAY, 5)
    ).toBe(null);
  });
});
