import { useEffect, useState } from 'react';
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

/** The height map of the whole Moon; null while it loads or if it failed (the globe stays plain). */
export function useGlobalRelief(): ElevationRaster | null {
  const [raster, setRaster] = useState<ElevationRaster | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((result) => {
        if (!cancelled) setRaster(result);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return raster;
}
