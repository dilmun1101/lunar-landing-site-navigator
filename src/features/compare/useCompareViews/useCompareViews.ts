import { useEffect, useRef, useState } from 'react';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { fetchHorizonProfile } from '@/lib/horizon/horizonProfiles/horizonProfiles';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';
import type { CompareItem } from '@/state/useCompareList/useCompareList';
import { durationDays } from '@/state/useScenarioStore/useScenarioStore';

export type CompareViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'noData' }
  | { status: 'ready'; view: ScenarioView };

export interface CompareViews {
  states: Record<string, CompareViewState>;
  /** Requests the data of one scenario again */
  reload: (id: string) => void;
}

/** Requests Horizons data for every scenario in the compare list and calculates its metrics. */
export function useCompareViews(items: CompareItem[]): CompareViews {
  const [states, setStates] = useState<Record<string, CompareViewState>>({});
  // Changes on every reload so that the effect below runs again
  const [version, setVersion] = useState(0);
  // ids whose request has already been sent, so it is not resent on every render
  const started = useRef(new Set<string>());

  useEffect(() => {
    const signal = new AbortController().signal;

    for (const item of items) {
      if (started.current.has(item.id)) continue;
      started.current.add(item.id);

      const set = (state: CompareViewState) =>
        setStates((current) => ({ ...current, [item.id]: state }));

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
          const view = buildScenarioView({
            id: item.id,
            siteName: item.siteName,
            epoch,
            durationDays: days,
            ephemeris,
            horizon: profile,
          });
          set(view ? { status: 'ready', view } : { status: 'error' });
        })
        .catch((error: unknown) => {
          console.error(error);
          set({ status: 'error' });
        });
    }
  }, [items, version]);

  const reload = (id: string) => {
    started.current.delete(id);
    setStates((current) => ({ ...current, [id]: { status: 'loading' } }));
    setVersion((current) => current + 1);
  };

  return { states, reload };
}
