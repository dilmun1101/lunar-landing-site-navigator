import { describe, expect, it } from 'vitest';
import { MOON_RADIUS_KM } from '@/domain/horizon/terrainHorizon/terrainHorizon';
import { neighbourPoints } from '@/domain/terrain/neighbours/neighbours';

const rad = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance on the Moon, km. */
function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) {
  const cos =
    Math.sin(rad(a.lat)) * Math.sin(rad(b.lat)) +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon));
  return MOON_RADIUS_KM * Math.acos(Math.min(1, cos));
}

describe('neighbourPoints', () => {
  it('puts four points at the given distance', () => {
    const center = { lat: -86, lon: 0 };
    const points = neighbourPoints(center, 5);
    expect(points.map((point) => point.direction)).toEqual([
      'n',
      'e',
      's',
      'w',
    ]);
    for (const point of points) {
      expect(Math.abs(distanceKm(center, point) - 5)).toBeLessThan(0.05);
    }
  });

  it('moves north and south in latitude, east and west in longitude', () => {
    const [north, east, south, west] = neighbourPoints({ lat: 10, lon: 20 }, 5);
    expect(north?.lat).toBeGreaterThan(10);
    expect(south?.lat).toBeLessThan(10);
    expect(east?.lon).toBeGreaterThan(20);
    expect(west?.lon).toBeLessThan(20);
  });

  it('keeps the longitude within ±180°', () => {
    const points = neighbourPoints({ lat: 0, lon: 179.99 }, 5);
    for (const point of points) {
      expect(point.lon).toBeGreaterThanOrEqual(-180);
      expect(point.lon).toBeLessThan(180);
    }
  });
});
