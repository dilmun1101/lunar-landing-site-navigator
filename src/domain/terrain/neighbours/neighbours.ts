import {
  destination,
  MOON_RADIUS_KM,
} from '@/domain/horizon/terrainHorizon/terrainHorizon';

export type NeighbourDirection = 'n' | 'e' | 's' | 'w';

export interface NeighbourPoint {
  direction: NeighbourDirection;
  lat: number;
  lon: number;
}

const BEARINGS: Record<NeighbourDirection, number> = {
  n: 0,
  e: 90,
  s: 180,
  w: 270,
};

/** Rounded to 0.0001° (about 3 m): the same key as the horizon cache uses. */
const round = (value: number) => Math.round(value * 10_000) / 10_000;

/**
 * Points at the given distance north, east, south and west of the site.
 * Longitude is kept within [-180, 180).
 */
export function neighbourPoints(
  center: { lat: number; lon: number },
  distanceKm: number
): NeighbourPoint[] {
  const angle = distanceKm / MOON_RADIUS_KM;
  return (Object.keys(BEARINGS) as NeighbourDirection[]).map((direction) => {
    const point = destination(
      center.lat,
      center.lon,
      BEARINGS[direction],
      angle
    );
    const lon = ((((point.lon + 180) % 360) + 360) % 360) - 180;
    return { direction, lat: round(point.lat), lon: round(lon) };
  });
}
