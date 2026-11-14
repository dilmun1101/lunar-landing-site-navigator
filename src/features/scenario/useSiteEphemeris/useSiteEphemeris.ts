import { useEffect, useState } from 'react';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  fetchEphemeris,
  type SiteCoordinates,
} from '@/lib/horizons/horizonsClient/horizonsClient';

export type SiteEphemerisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; ephemeris: Ephemeris };

export type SiteEphemerisResult = SiteEphemerisState & {
  /** Drops the cached data and requests it from Horizons again */
  reload: () => void;
};

const DEBOUNCE_MS = 400;
const cache = new Map<string, Ephemeris>();

/**
 * Requests the Sun and Earth positions for a point on the Moon from JPL Horizons.
 * The request is delayed while the user drags the slider or types a date.
 */
export function useSiteEphemeris(
  coordinates: SiteCoordinates | null,
  epoch: Date,
  durationDays: number
): SiteEphemerisResult {
  // Result of the latest finished request, tagged with the request key.
  const [result, setResult] = useState<{
    key: string;
    ephemeris: Ephemeris | null;
  } | null>(null);

  const lat = coordinates?.lat;
  const lon = coordinates?.lon;
  const epochMinute = Math.floor(epoch.getTime() / 60_000);
  const [attempt, setAttempt] = useState(0);
  const cacheKey =
    lat === undefined || lon === undefined
      ? null
      : `${lat},${lon},${epochMinute},${durationDays}`;
  // The attempt number separates the result of a manual reload from the previous one
  const key = cacheKey === null ? null : `${cacheKey}#${attempt}`;

  const reload = () => {
    if (cacheKey !== null) cache.delete(cacheKey);
    setAttempt((current) => current + 1);
  };

  useEffect(() => {
    if (cacheKey === null || lat === undefined || lon === undefined) return;
    if (cache.has(cacheKey)) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchEphemeris(
        { lat, lon },
        epochMinute * 60_000,
        durationDays,
        controller.signal
      )
        .then((ephemeris) => {
          cache.set(cacheKey, ephemeris);
          setResult({ key: `${cacheKey}#${attempt}`, ephemeris });
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== 'AbortError') {
            console.error(error);
            setResult({ key: `${cacheKey}#${attempt}`, ephemeris: null });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cacheKey, attempt, lat, lon, epochMinute, durationDays]);

  // The state is derived from the key, so no setState is needed inside the effect.
  if (key === null || cacheKey === null) return { status: 'idle', reload };
  const cached = cache.get(cacheKey);
  if (cached) return { status: 'ready', ephemeris: cached, reload };
  if (result?.key === key) {
    return result.ephemeris
      ? { status: 'ready', ephemeris: result.ephemeris, reload }
      : { status: 'error', reload };
  }
  return { status: 'loading', reload };
}
