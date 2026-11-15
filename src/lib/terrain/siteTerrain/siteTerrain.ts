import { horizonKey } from '@/lib/horizon/horizonProfiles/horizonProfiles';
import {
  buildTerrainGrid,
  type TerrainGrid,
} from '@/domain/terrain/terrainGrid/terrainGrid';
import { createElevationModel } from '@/lib/lola/elevationWindow/elevationWindow';
import { fetchElevationTiles } from '@/lib/lola/lolaClient/lolaClient';

export interface TerrainSite {
  lat: number;
  lon: number;
}

/** The patch is 40 x 40 km: the 3D view shows what is around the site, not the whole region. */
const RADIUS_KM = 20;
const GRID_SIZE = 129;

const memory = new Map<string, TerrainGrid>();
const pending = new Map<string, Promise<TerrainGrid>>();

/** The grid if it has already been built in this session, otherwise null. */
export const peekSiteTerrain = (site: TerrainSite): TerrainGrid | null =>
  memory.get(horizonKey(site)) ?? null;

/** Forget the grid and any request in flight, so that the next fetch asks the service again. */
export function forgetSiteTerrain(site: TerrainSite): void {
  const key = horizonKey(site);
  memory.delete(key);
  pending.delete(key);
}

/**
 * Terrain around the site: LOLA elevations are requested from the USGS web service,
 * the corners of the square need a circle of radius * sqrt(2).
 */
export function fetchSiteTerrain(site: TerrainSite): Promise<TerrainGrid> {
  const key = horizonKey(site);
  const cached = memory.get(key);
  if (cached) return Promise.resolve(cached);

  let request = pending.get(key);
  if (!request) {
    request = fetchElevationTiles(site.lat, site.lon, RADIUS_KM * Math.SQRT2)
      .then((tiles) => {
        const grid = buildTerrainGrid(createElevationModel(tiles), site, {
          radiusKm: RADIUS_KM,
          size: GRID_SIZE,
        });
        if (!grid) throw new Error('LOLA: no elevation data at the point');
        memory.set(key, grid);
        return grid;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
  }
  return request;
}
