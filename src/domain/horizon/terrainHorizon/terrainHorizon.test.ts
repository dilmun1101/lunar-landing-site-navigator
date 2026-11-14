import { describe, expect, it } from 'vitest';
import {
  computeTerrainHorizon,
  type ElevationModel,
} from '@/domain/horizon/terrainHorizon/terrainHorizon';

const site = { lat: -86, lon: 20 };

/** Angular distance on the Moon, km. */
function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const cos =
    Math.sin(rad(a.lat)) * Math.sin(rad(b.lat)) +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return 1737.4 * Math.acos(Math.min(1, cos));
}

describe('computeTerrainHorizon', () => {
  it('is flat (about 0°) over a smooth sphere', () => {
    const flat: ElevationModel = { heightAt: () => 0 };
    const profile = computeTerrainHorizon(flat, site, {
      observerHeightKm: 0,
    });
    expect(profile).toHaveLength(72);
    for (const value of profile ?? [])
      expect(Math.abs(value)).toBeLessThan(0.1);
  });

  it('sees a 1 km high ring 5 km away at about 11°', () => {
    const ring: ElevationModel = {
      heightAt: (lat, lon) => {
        const d = distanceKm(site, { lat, lon });
        return d >= 5 && d <= 10 ? 1 : 0;
      },
    };
    const profile = computeTerrainHorizon(ring, site, {
      maxKm: 30,
      observerHeightKm: 0,
    });
    for (const value of profile ?? []) {
      expect(value).toBeGreaterThan(10.5);
      expect(value).toBeLessThan(11.5);
    }
  });

  it('puts a lone hill at its azimuth', () => {
    // A hill 8 km east of the site
    const hill = {
      lat: -86,
      lon: 20 + 8 / (30.32 * Math.cos((86 * Math.PI) / 180)),
    };
    const model: ElevationModel = {
      heightAt: (lat, lon) => (distanceKm(hill, { lat, lon }) < 1.5 ? 1 : 0),
    };
    const profile = computeTerrainHorizon(model, site, {
      maxKm: 30,
      observerHeightKm: 0,
    })!;
    const peak = profile.indexOf(Math.max(...profile)) * 5;
    expect(Math.abs(peak - 90)).toBeLessThanOrEqual(5);
  });

  it('returns null without data at the observer', () => {
    expect(computeTerrainHorizon({ heightAt: () => null }, site)).toBeNull();
  });
});
