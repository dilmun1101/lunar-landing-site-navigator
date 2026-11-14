import { computeTerrainHorizon } from '@/domain/horizon/terrainHorizon/terrainHorizon';
import { createElevationModel } from '@/lib/lola/elevationWindow/elevationWindow';
import { fetchElevationTiles } from '@/lib/lola/lolaClient/lolaClient';

export interface HorizonSite {
  lat: number;
  lon: number;
}

const RADIUS_KM = 120;
const STORAGE_PREFIX = 'horizon-profile:v1:';

const memory = new Map<string, number[]>();
const pending = new Map<string, Promise<number[]>>();

/** Cache key: coordinates rounded to ~10 m. */
export const horizonKey = ({ lat, lon }: HorizonSite) =>
  `${lat.toFixed(4)},${lon.toFixed(4)}`;

/** The profile if it has already been computed (this session or an earlier one), otherwise null. */
export function peekHorizonProfile(site: HorizonSite): number[] | null {
  const key = horizonKey(site);
  const cached = memory.get(key);
  if (cached) return cached;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      const profile = JSON.parse(stored) as number[];
      memory.set(key, profile);
      return profile;
    }
  } catch {
    // storage is unavailable — the profile will simply be requested again
  }
  return null;
}

/** Forgets the stored profile so that the next request goes to the web service again. */
export function forgetHorizonProfile(site: HorizonSite): void {
  const key = horizonKey(site);
  memory.delete(key);
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // storage is unavailable — nothing to forget
  }
}

/**
 * Terrain horizon of a point (72 values, every 5° of azimuth from north): LOLA elevations are
 * requested from the USGS web service and the horizon is calculated in the browser.
 * The request is shared and not cancellable: it finishes and fills the cache even if the caller left.
 */
export function fetchHorizonProfile(site: HorizonSite): Promise<number[]> {
  const cached = peekHorizonProfile(site);
  if (cached) return Promise.resolve(cached);

  const key = horizonKey(site);
  let request = pending.get(key);
  if (!request) {
    request = fetchElevationTiles(site.lat, site.lon, RADIUS_KM)
      .then((tiles) => {
        const profile = computeTerrainHorizon(
          createElevationModel(tiles),
          site,
          {
            maxKm: RADIUS_KM,
          }
        );
        if (!profile) throw new Error('LOLA: no elevation data at the point');
        memory.set(key, profile);
        try {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(profile));
        } catch {
          // ignore: only the persistent cache is lost
        }
        return profile;
      })
      .finally(() => pending.delete(key));
    pending.set(key, request);
  }
  return request;
}
