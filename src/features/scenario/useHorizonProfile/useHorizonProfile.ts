import { useEffect, useState } from 'react';
import {
  fetchHorizonProfile,
  forgetHorizonProfile,
  horizonKey,
  peekHorizonProfile,
  type HorizonSite,
} from '@/lib/horizon/horizonProfiles/horizonProfiles';

export type HorizonProfileState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; profile: number[] };

export type HorizonProfileResult = HorizonProfileState & {
  /** Drops the stored profile and requests it from LOLA again */
  reload: () => void;
};

/** Terrain horizon of the point, requested from LOLA via the USGS web service. */
export function useHorizonProfile(
  site: HorizonSite | null
): HorizonProfileResult {
  const [result, setResult] = useState<{
    key: string;
    profile: number[] | null;
  } | null>(null);

  const lat = site?.lat;
  const lon = site?.lon;
  const [attempt, setAttempt] = useState(0);
  const siteKey =
    lat === undefined || lon === undefined ? null : horizonKey({ lat, lon });
  // The attempt number separates the result of a manual reload from the previous one
  const key = siteKey === null ? null : `${siteKey}#${attempt}`;

  const reload = () => {
    if (lat !== undefined && lon !== undefined) {
      forgetHorizonProfile({ lat, lon });
    }
    setAttempt((current) => current + 1);
  };

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
  }, [key, attempt, lat, lon]);

  // The state is derived from the key, so no setState is needed inside the effect
  if (key === null || lat === undefined || lon === undefined) {
    return { status: 'idle', reload };
  }
  const cached = peekHorizonProfile({ lat, lon });
  if (cached) return { status: 'ready', profile: cached, reload };
  if (result?.key === key) {
    return result.profile
      ? { status: 'ready', profile: result.profile, reload }
      : { status: 'error', reload };
  }
  return { status: 'loading', reload };
}
