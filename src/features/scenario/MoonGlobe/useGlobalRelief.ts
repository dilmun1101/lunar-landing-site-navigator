import { useCallback, useEffect, useState } from 'react';
import { fetchGlobalRelief } from '@/lib/lola/globalRelief/globalRelief';
import type { ElevationRaster } from '@/lib/lola/parseElevationTiff/parseElevationTiff';

// One download for the whole session: switching the view back and forth does not repeat it.
let pending: Promise<ElevationRaster> | undefined;

function load(): Promise<ElevationRaster> {
  pending ??= fetchGlobalRelief().catch((error: unknown) => {
    pending = undefined; // let the next attempt try again
    throw error;
  });
  return pending;
}

/** Forget the downloaded map, so that the next mount downloads it again. */
export function forgetGlobalRelief(): void {
  pending = undefined;
}

export interface GlobalRelief {
  /** The height map of the whole Moon; null while it loads or if it failed (the globe stays plain). */
  raster: ElevationRaster | null;
  failed: boolean;
  /** Download the map again after a failure */
  retry: () => void;
}

export function useGlobalRelief(): GlobalRelief {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    raster: ElevationRaster | null;
  } | null>(null);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((raster) => {
        if (!cancelled) setResult({ attempt, raster });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (!cancelled) setResult({ attempt, raster: null });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const current = result?.attempt === attempt ? result : null;
  return {
    raster: current?.raster ?? null,
    failed: current !== null && current.raster === null,
    retry,
  };
}
