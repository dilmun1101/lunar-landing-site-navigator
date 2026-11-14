import { useEffect, useState } from 'react';
import {
  fetchHorizonProfile,
  horizonKey,
  peekHorizonProfile,
  type HorizonSite,
} from '@/lib/horizon/horizonProfiles/horizonProfiles';

export type HorizonProfileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; profile: number[] };

/** Terrain horizon of the point, requested from LOLA via the USGS web service. */
export function useHorizonProfile(
  site: HorizonSite | null
): HorizonProfileState {
  const [result, setResult] = useState<{
    key: string;
    profile: number[] | null;
  } | null>(null);

  const lat = site?.lat;
  const lon = site?.lon;
  const key =
    lat === undefined || lon === undefined ? null : horizonKey({ lat, lon });

  useEffect(() => {
    if (key === null || lat === undefined || lon === undefined) return;
    if (peekHorizonProfile({ lat, lon })) return;

    let active = true;
    fetchHorizonProfile({ lat, lon })
      .then((profile) => {
        if (active) setResult({ key, profile });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (active) setResult({ key, profile: null });
      });
    return () => {
      active = false;
    };
  }, [key, lat, lon]);

  // The state is derived from the key, so no setState is needed inside the effect
  if (key === null || lat === undefined || lon === undefined) {
    return { status: 'idle' };
  }
  const cached = peekHorizonProfile({ lat, lon });
  if (cached) return { status: 'ready', profile: cached };
  if (result?.key === key) {
    return result.profile
      ? { status: 'ready', profile: result.profile }
      : { status: 'error' };
  }
  return { status: 'loading' };
}
