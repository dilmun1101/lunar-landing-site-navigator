import { describe, expect, it } from 'vitest';
import { maskEphemeris } from '@/domain/criteria/missionSegments';
import { skySnapshot } from '@/domain/ephemeris/skySnapshot/skySnapshot';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

const HOUR = 3_600_000;
const DAY = 86_400_000;
const FLAT = Array.from({ length: 72 }, () => 0);

/** 10 days, hourly: the Sun is up for the first 5 days, the Earth is always up. */
function makeEphemeris(): Ephemeris {
  const count = 10 * 24 + 1;
  return {
    startMs: 0,
    stepMs: HOUR,
    sun: {
      az: Array.from({ length: count }, () => 90),
      el: Array.from({ length: count }, (_, index) =>
        index < 5 * 24 ? 5 : -5
      ),
    },
    earth: {
      az: Array.from({ length: count }, () => 180),
      el: Array.from({ length: count }, () => 10),
    },
  };
}

const hoursOf = (duration: { days: number; hours: number } | null) =>
  duration ? duration.days * 24 + duration.hours : null;

describe('skySnapshot', () => {
  const ephemeris = makeEphemeris();

  it('gives the positions at the requested moment', () => {
    const snapshot = skySnapshot(ephemeris, ephemeris, FLAT, DAY, 10 * DAY);
    expect(snapshot?.sun).toEqual({ azimuth: 90, elevation: 5 });
    expect(snapshot?.earth).toEqual({ azimuth: 180, elevation: 10 });
  });

  it('returns null outside the data range', () => {
    expect(skySnapshot(ephemeris, ephemeris, FLAT, -1, 10 * DAY)).toBeNull();
    expect(
      skySnapshot(ephemeris, ephemeris, FLAT, 11 * DAY, 12 * DAY)
    ).toBeNull();
  });

  it('counts the time to sunset down as the moment moves on', () => {
    const start = skySnapshot(ephemeris, ephemeris, FLAT, 0, 10 * DAY);
    const later = skySnapshot(ephemeris, ephemeris, FLAT, DAY, 10 * DAY);
    const before = hoursOf(start?.sunset ?? null);
    const after = hoursOf(later?.sunset ?? null);
    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect((before ?? 0) - (after ?? 0)).toBe(24);
  });

  it('has no sunset while the Sun is below the horizon', () => {
    const night = skySnapshot(ephemeris, ephemeris, FLAT, 6 * DAY, 10 * DAY);
    expect(night?.sunset).toBeNull();
    expect(night?.sunTrack).toEqual([]);
    expect(night?.earthset).not.toBeNull();
  });

  it('draws a track of a visible body', () => {
    const snapshot = skySnapshot(ephemeris, ephemeris, FLAT, 0, 10 * DAY);
    expect(snapshot?.sunTrack.length).toBe(13);
    expect(snapshot?.earthTrack.length).toBe(13);
  });

  it('hides a body behind the terrain', () => {
    const terrain = Array.from({ length: 72 }, () => 20);
    const visible = maskEphemeris(ephemeris, terrain);
    const snapshot = skySnapshot(ephemeris, visible, terrain, 0, 10 * DAY);
    expect(snapshot?.earthset).toBeNull();
    expect(snapshot?.earthTrack).toEqual([]);
    // The raw position is still reported: the chart draws the terrain itself
    expect(snapshot?.earth.elevation).toBe(10);
  });
});
