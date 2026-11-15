import { useCallback, useEffect, useState } from 'react';
import type { TerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';
import { horizonKey } from '@/lib/horizon/horizonProfiles/horizonProfiles';
import {
  fetchSiteTerrain,
  peekSiteTerrain,
  type TerrainSite,
} from '@/lib/terrain/siteTerrain/siteTerrain';

export type SiteTerrainState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; grid: TerrainGrid };

export type SiteTerrain = SiteTerrainState & {
  /** Request the terrain again after a failure */
  retry: () => void;
};

/**
 * Terrain around the site for the 3D view.
 * `enabled` false — nothing is requested (the 3D relief is off).
 */
export function useSiteTerrain(
  site: TerrainSite | null,
  enabled: boolean
): SiteTerrain {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    grid: TerrainGrid | null;
  } | null>(null);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  const lat = site?.lat;
  const lon = site?.lon;
  const key =
    enabled && lat !== undefined && lon !== undefined
      ? horizonKey({ lat, lon })
      : null;
  // A new attempt is a new key: the old failure no longer counts
  const resultKey = key === null ? null : `${key}#${attempt}`;

  useEffect(() => {
    if (key === null || resultKey === null) return;
    if (lat === undefined || lon === undefined) return;
    if (peekSiteTerrain({ lat, lon })) return;

    let active = true;
    fetchSiteTerrain({ lat, lon })
      .then((grid) => {
        if (active) setResult({ key: resultKey, grid });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (active) setResult({ key: resultKey, grid: null });
      });
    return () => {
      active = false;
    };
  }, [key, resultKey, lat, lon]);

  // The state is derived from the key, so no setState is needed inside the effect
  if (
    key === null ||
    lat === undefined ||
    lon === undefined ||
    resultKey === null
  ) {
    return { status: 'idle', retry };
  }
  const cached = peekSiteTerrain({ lat, lon });
  if (cached) return { status: 'ready', grid: cached, retry };
  if (result?.key === resultKey) {
    return result.grid
      ? { status: 'ready', grid: result.grid, retry }
      : { status: 'error', retry };
  }
  return { status: 'loading', retry };
}
