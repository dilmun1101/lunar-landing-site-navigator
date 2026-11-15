import { describe, expect, it } from 'vitest';
import { maskByTerrain } from '@/domain/horizon/visibility/visibility';
import { aboveHorizon } from '@/domain/metrics/windows/windows';

const HOUR = 3_600_000;

describe('maskByTerrain', () => {
  const timeline = { startMs: 0, stepMs: HOUR };
  // The body sits at the azimuth 90° all the time; its elevation rises from -2° to 4° and falls back.
  const series = {
    az: [90, 90, 90, 90, 90],
    el: [-2, 1, 4, 1, -2],
  };

  it('with a flat horizon keeps the geometric visibility', () => {
    const flat = maskByTerrain(series, Array(72).fill(0));
    expect(aboveHorizon(flat, timeline, 0, 4 * HOUR)).toEqual(
      aboveHorizon(series, timeline, 0, 4 * HOUR)
    );
  });

  it('shortens the visible window when the terrain is 2° high', () => {
    const profile = Array(72).fill(2);
    const [segment = [0, 0]] = aboveHorizon(
      maskByTerrain(series, profile),
      timeline,
      0,
      4 * HOUR
    );
    // elevation crosses 2° at 1.333 h and 2.667 h
    expect(segment[0] / HOUR).toBeCloseTo(1 + 1 / 3);
    expect(segment[1] / HOUR).toBeCloseTo(2 + 2 / 3);
  });

  it('hides the body completely behind a mountain', () => {
    const profile = Array(72).fill(10);
    expect(
      aboveHorizon(maskByTerrain(series, profile), timeline, 0, 4 * HOUR)
    ).toEqual([]);
  });
});
