import { useEffect, useMemo, useState } from 'react';
import type { Criteria } from '@/domain/criteria/criteria';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  type BestStart,
  computePlannerValues,
  findBestStart,
  type PlannerMetric,
  plannerSpanDays,
  plannerStarts,
  type PlannerValues,
} from '@/domain/planner/plannerValues/plannerValues';
import {
  forgetStoredEphemeris,
  readStoredEphemeris,
  storeEphemeris,
} from '@/features/planner/plannerStorage';
import {
  plannerSites,
  type PlannerSite,
} from '@/features/planner/plannerSites';
import {
  fetchHorizonProfile,
  forgetHorizonProfile,
} from '@/lib/horizon/horizonProfiles/horizonProfiles';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';

/** Loaded data of a site: the criteria are applied to it without new requests. */
interface SiteData {
  ephemeris: Ephemeris;
  /** null — the LOLA profile could not be loaded and the horizon is flat */
  terrain: number[] | null;
}

export type PlannerRowState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      values: PlannerValues;
      /** The best start of the mission by the chosen metric */
      best: BestStart | null;
      terrain: boolean;
    };

export interface PlannerData {
  /** State of every planner site by its id */
  states: Record<string, PlannerRowState>;
  /** Requests again the sites that failed or got a flat horizon */
  reload: () => void;
}

const DEBOUNCE_MS = 400;
const CONCURRENCY = 3;
/**
 * The planner needs only the share of the mission, not the exact moments, so a coarse step is
 * enough. It makes the Horizons requests several times smaller and faster.
 */
const STEP_MINUTES = 240;
const cache = new Map<string, SiteData>();

/** Calculated values, so that they are not recalculated every time another site is loaded. */
interface Derived {
  source: SiteData;
  values: PlannerValues;
  best: BestStart | null;
}
const derived = new Map<string, Derived>();
const MAX_DERIVED = 300;

const scopeOf = (startMs: number, durationDays: number) =>
  `${startMs}|${durationDays}|${STEP_MINUTES}`;

const cacheKey = (site: PlannerSite, startMs: number, durationDays: number) =>
  `${site.coordinates.lat},${site.coordinates.lon}|${scopeOf(startMs, durationDays)}`;

/**
 * Share of the mission with the Sun and the Earth visible for every planner site and start date.
 * Sites are requested two at a time, so rows fill in one after another.
 */
export function usePlannerData(
  startMs: number,
  durationDays: number,
  criteria: Criteria,
  metric: PlannerMetric
): PlannerData {
  // Results of the finished requests; null — the request failed.
  const [results, setResults] = useState<Record<string, SiteData | null>>({});
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
          readStoredEphemeris(key) ??
            fetchEphemeris(
              site.coordinates,
              startMs,
              spanDays,
              controller.signal,
              STEP_MINUTES
            ).then((loaded) => {
              storeEphemeris(key, scopeOf(startMs, durationDays), loaded);
              return loaded;
            }),
          fetchHorizonProfile(site.coordinates).catch(() => null),
        ]);
        // Throws if the data does not cover the mission, so such a site counts as failed
        computePlannerValues(ephemeris, terrain, starts, durationDays);
        const data: SiteData = { ephemeris, terrain };
        cache.set(key, data);
        setResults((current) => ({ ...current, [`${key}#${version}`]: data }));
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        console.error(error);
        forgetStoredEphemeris(key);
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
  const states = useMemo(() => {
    const starts = plannerStarts(startMs);
    const lastStartMs = starts[starts.length - 1] ?? startMs;
    const result: Record<string, PlannerRowState> = {};
    for (const site of plannerSites) {
      const key = cacheKey(site, startMs, durationDays);
      const cached = cache.get(key);
      if (cached) {
        const derivedKey = `${key}|${metric}|${Object.values(criteria).join(',')}`;
        let entry = derived.get(derivedKey);
        if (entry?.source !== cached) {
          if (derived.size >= MAX_DERIVED) derived.clear();
          entry = {
            source: cached,
            values: computePlannerValues(
              cached.ephemeris,
              cached.terrain,
              starts,
              durationDays,
              criteria
            ),
            best: findBestStart(
              cached.ephemeris,
              cached.terrain,
              metric,
              startMs,
              lastStartMs,
              durationDays,
              criteria
            ),
          };
          derived.set(derivedKey, entry);
        }
        result[site.id] = {
          status: 'ready',
          values: entry.values,
          best: entry.best,
          terrain: cached.terrain !== null,
        };
      } else {
        result[site.id] =
          results[`${key}#${version}`] === null
            ? { status: 'error' }
            : { status: 'loading' };
      }
    }
    return result;
    // `results` changes whenever a site is loaded, which is when the cache changes
  }, [results, version, startMs, durationDays, criteria, metric]);

  const reload = () => {
    for (const site of plannerSites) {
      const key = cacheKey(site, startMs, durationDays);
      if (cache.get(key)?.terrain) continue;
      cache.delete(key);
      forgetHorizonProfile(site.coordinates);
    }
    setVersion((current) => current + 1);
  };

  return { states, reload };
}
