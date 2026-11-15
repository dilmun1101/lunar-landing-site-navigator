import { describe, expect, it } from 'vitest';
import { skySnapshot } from '@/domain/ephemeris/skySnapshot/skySnapshot';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';

const HOUR = 3_600_000;
const DAY = 86_400_000;

/** 10 days, hourly: the Sun is up for the first 5 days, the Earth is always up. */
const count = 10 * 24 + 1;
const ephemeris: Ephemeris = {
  startMs: 0,
  stepMs: HOUR,
  sun: {
    az: Array.from({ length: count }, () => 90),
    el: Array.from({ length: count }, (_, index) => (index < 5 * 24 ? 5 : -5)),
  },
  earth: {
    az: Array.from({ length: count }, () => 180),
    el: Array.from({ length: count }, () => 10),
  },
};

describe('buildScenarioView', () => {
  it('shows the sky at the start of the mission', () => {
    const view = buildScenarioView({
      id: 'x',
      siteName: 'Test',
      epoch: new Date(0),
      durationDays: 4,
      ephemeris,
    });
    const flat = Array.from({ length: 72 }, () => 0);
    const sky = skySnapshot(ephemeris, ephemeris, flat, 0, 4 * DAY);
    expect(view?.sun).toEqual(sky?.sun);
    expect(view?.sunset).toEqual(sky?.sunset);
    expect(view?.sunTrack).toEqual(sky?.sunTrack);
    expect(view?.sunlightPercent).toBe(100);
  });

  it('returns null if the mission does not fit into the data', () => {
    expect(
      buildScenarioView({
        id: 'x',
        siteName: 'Test',
        epoch: new Date(8 * DAY),
        durationDays: 4,
        ephemeris,
      })
    ).toBeNull();
  });
});
