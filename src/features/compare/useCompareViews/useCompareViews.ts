import { useEffect, useMemo, useRef, useState } from 'react';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { fetchHorizonProfile } from '@/lib/horizon/horizonProfiles/horizonProfiles';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';
import type { CompareItem } from '@/state/useCompareList/useCompareList';
import { useCriteriaStore } from '@/state/useCriteriaStore/useCriteriaStore';
import { durationDays } from '@/state/useScenarioStore/useScenarioStore';

export type CompareViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'noData' }
  | { status: 'ready'; view: ScenarioView };

/** Loaded data of a scenario: the view is built from it with the current criteria. */
type RawState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'noData' }
  | { status: 'ready'; ephemeris: Ephemeris; profile: number[] | null };

export interface CompareViews {
  states: Record<string, CompareViewState>;
  /** Requests the data of one scenario again */
  reload: (id: string) => void;
}

/** Requests Horizons data for every scenario in the compare list and calculates its metrics. */
export function useCompareViews(items: CompareItem[]): CompareViews {
  const [raw, setRaw] = useState<Record<string, RawState>>({});
  const criteria = useCriteriaStore((state) => state.criteria);
  // Changes on every reload so that the effect below runs again
  const [version, setVersion] = useState(0);
  // ids whose request has already been sent, so it is not resent on every render
  const started = useRef(new Set<string>());

  useEffect(() => {
    const signal = new AbortController().signal;

    for (const item of items) {
      if (started.current.has(item.id)) continue;
      started.current.add(item.id);

      const set = (state: RawState) =>
        setRaw((current) => ({ ...current, [item.id]: state }));

      if (!item.coordinates) {
        set({ status: 'noData' });
        continue;
      }

      set({ status: 'loading' });
      const days = durationDays[item.duration];
      const epoch = new Date(item.epoch);
      Promise.all([
        fetchEphemeris(item.coordinates, epoch.getTime(), days, signal),
        // Without terrain data the horizon stays flat
        fetchHorizonProfile(item.coordinates).catch(() => null),
      ])
        .then(([ephemeris, profile]) => {
          set({ status: 'ready', ephemeris, profile });
        })
        .catch((error: unknown) => {
          console.error(error);
          set({ status: 'error' });
        });
    }
  }, [items, version]);

  // The views are rebuilt when the criteria change, without new requests.
  const states = useMemo(() => {
    const result: Record<string, CompareViewState> = {};
    for (const item of items) {
      const state = raw[item.id];
      if (!state) continue;
      if (state.status !== 'ready') {
        result[item.id] = state;
        continue;
      }
      const view = buildScenarioView({
        id: item.id,
        siteName: item.siteName,
        epoch: new Date(item.epoch),
        durationDays: durationDays[item.duration],
        ephemeris: state.ephemeris,
        horizon: state.profile,
        criteria,
      });
      result[item.id] = view ? { status: 'ready', view } : { status: 'error' };
    }
    return result;
  }, [raw, items, criteria]);

  const reload = (id: string) => {
    started.current.delete(id);
    setRaw((current) => ({ ...current, [id]: { status: 'loading' } }));
    setVersion((current) => current + 1);
  };

  return { states, reload };
}
