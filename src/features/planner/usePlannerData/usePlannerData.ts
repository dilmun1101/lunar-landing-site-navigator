import { useEffect, useState } from 'react';
import {
  computePlannerValues,
  plannerSpanDays,
  plannerStarts,
  type PlannerValues,
} from '@/domain/planner/plannerValues/plannerValues';
import {
  plannerSites,
  type PlannerSite,
} from '@/features/planner/plannerSites';
import {
  fetchHorizonProfile,
  forgetHorizonProfile,
} from '@/lib/horizon/horizonProfiles/horizonProfiles';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';

interface ReadyRow {
  values: PlannerValues;
  /** false — the LOLA profile could not be loaded and the horizon is flat */
  terrain: boolean;
}

export type PlannerRowState =
  | { status: 'loading' }
  | { status: 'error' }
  | ({ status: 'ready' } & ReadyRow);

export interface PlannerData {
  /** State of every planner site by its id */
  states: Record<string, PlannerRowState>;
  /** Requests again the sites that failed or got a flat horizon */
  reload: () => void;
}

const DEBOUNCE_MS = 400;
const CONCURRENCY = 2;
const cache = new Map<string, ReadyRow>();

const cacheKey = (site: PlannerSite, startMs: number, durationDays: number) =>
  `${site.coordinates.lat},${site.coordinates.lon}|${startMs}|${durationDays}`;

/**
 * Share of the mission with the Sun and the Earth visible for every planner site and start date.
 * Sites are requested two at a time, so rows fill in one after another.
 */
export function usePlannerData(
  startMs: number,
  durationDays: number
): PlannerData {
  // Results of the finished requests; null — the request failed.
  const [results, setResults] = useState<Record<string, ReadyRow | null>>({});
  // Changes on every reload so that the effect below runs again
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const queue = plannerSites.filter(
      (site) => !cache.has(cacheKey(site, startMs, durationDays))
    );
    if (queue.length === 0) return;

    const controller = new AbortController();
    const starts = plannerStarts(startMs);
    const spanDays = plannerSpanDays(durationDays);

    const load = async (site: PlannerSite) => {
      const key = cacheKey(site, startMs, durationDays);
      try {
        const [ephemeris, terrain] = await Promise.all([
          fetchEphemeris(
            site.coordinates,
            startMs,
            spanDays,
            controller.signal
          ),
          fetchHorizonProfile(site.coordinates).catch(() => null),
        ]);
        const row: ReadyRow = {
          values: computePlannerValues(
            ephemeris,
            terrain,
            starts,
            durationDays
          ),
          terrain: terrain !== null,
        };
        cache.set(key, row);
        setResults((current) => ({ ...current, [`${key}#${version}`]: row }));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error(error);
        setResults((current) => ({ ...current, [`${key}#${version}`]: null }));
      }
    };

    const worker = async () => {
      for (let site = queue.shift(); site; site = queue.shift()) {
        if (controller.signal.aborted) return;
        await load(site);
      }
    };

    const timer = setTimeout(() => {
      for (let index = 0; index < CONCURRENCY; index++) void worker();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [startMs, durationDays, version]);

  // The state is derived from the caches, so no setState is needed inside the effect.
  const states: Record<string, PlannerRowState> = {};
  for (const site of plannerSites) {
    const key = cacheKey(site, startMs, durationDays);
    const cached = cache.get(key);
    if (cached) {
      states[site.id] = { status: 'ready', ...cached };
    } else {
      states[site.id] =
        results[`${key}#${version}`] === null
          ? { status: 'error' }
          : { status: 'loading' };
    }
  }

  const reload = () => {
    for (const site of plannerSites) {
      const key = cacheKey(site, startMs, durationDays);
      if (cache.get(key)?.terrain === true) continue;
      cache.delete(key);
      forgetHorizonProfile(site.coordinates);
    }
    setVersion((current) => current + 1);
  };

  return { states, reload };
}
