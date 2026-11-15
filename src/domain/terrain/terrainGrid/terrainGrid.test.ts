import { describe, expect, it } from 'vitest';
import { buildTerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';

const SITE = { lat: -85, lon: 20 };

describe('buildTerrainGrid', () => {
  it('returns null without data at the site', () => {
    expect(buildTerrainGrid({ heightAt: () => null }, SITE)).toBeNull();
  });

  it('is zero on a flat model without curvature', () => {
    const grid = buildTerrainGrid({ heightAt: () => 1.5 }, SITE, {
      size: 9,
      curvature: false,
    });
    expect(grid).not.toBeNull();
    expect(grid?.groundKm).toBe(1.5);
    expect([...(grid?.heights ?? [])].every((h) => Math.abs(h) < 1e-6)).toBe(
      true
    );
  });

  it('is zero at the site and drops away from it with curvature', () => {
    const size = 9;
    const radiusKm = 20;
    const grid = buildTerrainGrid({ heightAt: () => 0 }, SITE, {
      size,
      radiusKm,
    });
    const heights = grid?.heights ?? new Float32Array();
    const center = (size - 1) / 2;
    expect(heights[center * size + center]).toBeCloseTo(0, 6);
    // east edge, 20 km away: d^2 / (2R) = 400 / 3474.8 = 0.115 km below the plane
    expect(heights[center * size + (size - 1)]).toBeCloseTo(-0.1151, 3);
  });

  it('puts the north at row 0 and the east at the last column', () => {
    const size = 9;
    // Higher toward the north (latitude) and toward the east (longitude)
    const model = {
      heightAt: (lat: number, lon: number) => 0.1 * lat + 0.1 * lon,
    };
    const grid = buildTerrainGrid(
      model,
      { lat: 0, lon: 0 },
      {
        size,
        radiusKm: 20,
        curvature: false,
      }
    );
    const heights = grid?.heights ?? new Float32Array();
    const mid = (size - 1) / 2;
    const northEdge = heights[0 * size + mid] as number;
    const southEdge = heights[(size - 1) * size + mid] as number;
    const westEdge = heights[mid * size + 0] as number;
    const eastEdge = heights[mid * size + (size - 1)] as number;
    expect(northEdge).toBeGreaterThan(southEdge);
    expect(eastEdge).toBeGreaterThan(westEdge);
  });

  it('fills cells without data with the ground height', () => {
    const grid = buildTerrainGrid(
      {
        heightAt: (lat) => (lat > -84.9 ? null : 2),
      },
      SITE,
      { size: 5, curvature: false }
    );
    expect(grid?.heights.every((h) => h === 0)).toBe(true);
  });
});
