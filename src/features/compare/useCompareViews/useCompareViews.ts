import { useEffect, useRef, useState } from 'react';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';
import type { CompareItem } from '@/state/useCompareList/useCompareList';
import { durationDays } from '@/state/useScenarioStore/useScenarioStore';

export type CompareViewState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'noData' }
  | { status: 'ready'; view: ScenarioView };

/** Requests Horizons data for every scenario in the compare list and calculates its metrics. */
export function useCompareViews(
  items: CompareItem[]
): Record<string, CompareViewState> {
  const [states, setStates] = useState<Record<string, CompareViewState>>({});
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
      fetchEphemeris(item.coordinates, epoch.getTime(), days, signal)
        .then((ephemeris) => {
          const view = buildScenarioView({
            id: item.id,
            siteName: item.siteName,
            epoch,
            durationDays: days,
            ephemeris,
          });
          set(view ? { status: 'ready', view } : { status: 'error' });
        })
        .catch((error: unknown) => {
          console.error(error);
          set({ status: 'error' });
        });
    }
  }, [items]);

  return states;
}
