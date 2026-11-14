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
): SiteEphemerisState {
  // Result of the latest finished request, tagged with the request key.
  const [result, setResult] = useState<{
    key: string;
    ephemeris: Ephemeris | null;
  } | null>(null);

  const lat = coordinates?.lat;
  const lon = coordinates?.lon;
  const epochMinute = Math.floor(epoch.getTime() / 60_000);
  const key =
    lat === undefined || lon === undefined
      ? null
      : `${lat},${lon},${epochMinute},${durationDays}`;

  useEffect(() => {
    if (key === null || lat === undefined || lon === undefined) return;
    if (cache.has(key)) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchEphemeris(
        { lat, lon },
        epochMinute * 60_000,
        durationDays,
        controller.signal
      )
        .then((ephemeris) => {
          cache.set(key, ephemeris);
          setResult({ key, ephemeris });
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== 'AbortError') {
            console.error(error);
            setResult({ key, ephemeris: null });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, lat, lon, epochMinute, durationDays]);

  // The state is derived from the key, so no setState is needed inside the effect.
  if (key === null) return { status: 'idle' };
  const cached = cache.get(key);
  if (cached) return { status: 'ready', ephemeris: cached };
  if (result?.key === key) {
    return result.ephemeris
      ? { status: 'ready', ephemeris: result.ephemeris }
      : { status: 'error' };
  }
  return { status: 'loading' };
}
