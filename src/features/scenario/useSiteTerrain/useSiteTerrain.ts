import { useEffect, useState } from 'react';
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

/**
 * Terrain around the site for the 3D view.
 * `enabled` false — nothing is requested (the 3D relief is off).
 */
export function useSiteTerrain(
  site: TerrainSite | null,
  enabled: boolean
): SiteTerrainState {
  const [result, setResult] = useState<{
    key: string;
    grid: TerrainGrid | null;
  } | null>(null);

  const lat = site?.lat;
  const lon = site?.lon;
  const key =
    enabled && lat !== undefined && lon !== undefined
      ? horizonKey({ lat, lon })
      : null;

  useEffect(() => {
    if (key === null || lat === undefined || lon === undefined) return;
    if (peekSiteTerrain({ lat, lon })) return;

    let active = true;
    fetchSiteTerrain({ lat, lon })
      .then((grid) => {
        if (active) setResult({ key, grid });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (active) setResult({ key, grid: null });
      });
    return () => {
      active = false;
    };
  }, [key, lat, lon]);

  // The state is derived from the key, so no setState is needed inside the effect
  if (key === null || lat === undefined || lon === undefined) {
    return { status: 'idle' };
  }
  const cached = peekSiteTerrain({ lat, lon });
  if (cached) return { status: 'ready', grid: cached };
  if (result?.key === key) {
    return result.grid
      ? { status: 'ready', grid: result.grid }
      : { status: 'error' };
  }
  return { status: 'loading' };
}
