import { computeTerrainHorizon } from '@/domain/horizon/terrainHorizon/terrainHorizon';
import { HORIZON_RADIUS_KM } from '@/lib/horizon/horizonProfiles/horizonProfiles';
import { createElevationModel } from '@/lib/lola/elevationWindow/elevationWindow';
import { fetchElevationTiles } from '@/lib/lola/lolaClient/lolaClient';

/**
 * Terrain horizons of several points near one site from a single LOLA download:
 * the window around the site is widened by `spreadKm`, so it covers every point.
 * null for a point the elevation model has no data for.
 */
export async function fetchHorizonsAround(
  center: { lat: number; lon: number },
  points: { lat: number; lon: number }[],
  spreadKm: number
): Promise<(number[] | null)[]> {
  const tiles = await fetchElevationTiles(
    center.lat,
    center.lon,
    HORIZON_RADIUS_KM + spreadKm
  );
  const model = createElevationModel(tiles);
  return points.map((point) =>
    computeTerrainHorizon(model, point, { maxKm: HORIZON_RADIUS_KM })
  );
}
