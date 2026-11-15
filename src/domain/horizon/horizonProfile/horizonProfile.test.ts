import { describe, expect, it } from 'vitest';
import { terrainElevationAt } from '@/domain/horizon/horizonProfile/horizonProfile';

const profile = Array.from({ length: 72 }, (_, index) => index % 4);

describe('terrainElevationAt', () => {
  it('returns the sample at exact azimuths', () => {
    expect(terrainElevationAt(profile, 0)).toBe(0);
    expect(terrainElevationAt(profile, 5)).toBe(1);
    expect(terrainElevationAt(profile, 15)).toBe(3);
  });

  it('interpolates between samples', () => {
    expect(terrainElevationAt(profile, 2.5)).toBeCloseTo(0.5);
  });

  it('wraps around 360° in both directions', () => {
    expect(terrainElevationAt(profile, 360)).toBe(0);
    expect(terrainElevationAt(profile, -5)).toBe(profile[71]);
    // between the last sample (355°) and the first one (360° = 0°)
    expect(terrainElevationAt(profile, 357.5)).toBeCloseTo(
      ((profile[71] ?? 0) + (profile[0] ?? 0)) / 2
    );
  });

  it('is flat for an empty profile', () => {
    expect(terrainElevationAt([], 123)).toBe(0);
  });
});
