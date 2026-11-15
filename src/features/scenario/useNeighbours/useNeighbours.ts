import { useEffect, useMemo, useState } from 'react';
import type { Criteria } from '@/domain/criteria/criteria';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  neighbourPoints,
  type NeighbourPoint,
} from '@/domain/terrain/neighbours/neighbours';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { fetchHorizonsAround } from '@/lib/horizon/neighbourHorizons/neighbourHorizons';
import { fetchEphemeris } from '@/lib/horizons/horizonsClient/horizonsClient';

export type NeighbourRow =
  | { point: NeighbourPoint; status: 'ready'; view: ScenarioView }
  | { point: NeighbourPoint; status: 'error' };

export type NeighboursState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; rows: NeighbourRow[] };

export interface NeighboursInput {
  center: { lat: number; lon: number } | null;
  epoch: Date;
  durationDays: number;
  distanceKm: number;
  criteria: Criteria;
}

/** Loaded data of one point: the view is built from it with the current criteria. */
interface PointData {
  point: NeighbourPoint;
  ephemeris: Ephemeris | null;
  horizon: number[] | null;
}

// Results of this session: going back to a site does not repeat the requests
const cache = new Map<string, PointData[]>();

/**
 * The same scenario at points a few kilometers around the site.
 * Nothing is requested until `calculate` is called: one LOLA download for all the points
 * and two Horizons requests per point.
 */
export function useNeighbours({
  center,
  epoch,
  durationDays,
  distanceKm,
  criteria,
}: NeighboursInput) {
  const lat = center?.lat;
  const lon = center?.lon;
  const epochMs = epoch.getTime();
  const key =
    lat === undefined || lon === undefined
      ? null
      : `${lat},${lon}|${epochMs}|${durationDays}|${distanceKm}`;

  // The key the user asked to calculate; another site or date needs a new click
  const [requested, setRequested] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: PointData[] | null;
  } | null>(null);
  const enabled = key !== null && requested === key;

  useEffect(() => {
    if (!enabled || key === null || lat === undefined || lon === undefined)
      return;
    if (cache.has(key)) return;

    const controller = new AbortController();
    const points = neighbourPoints({ lat, lon }, distanceKm);
    Promise.all([
      fetchHorizonsAround({ lat, lon }, points, distanceKm),
      Promise.all(
        points.map((point) =>
          fetchEphemeris(point, epochMs, durationDays, controller.signal).catch(
            (error: unknown) => {
              if ((error as Error).name === 'AbortError') throw error;
              console.error(error);
              return null;
            }
          )
        )
      ),
    ])
      .then(([horizons, ephemerides]) => {
        const data = points.map((point, index) => ({
          point,
          ephemeris: ephemerides[index] ?? null,
          horizon: horizons[index] ?? null,
        }));
        cache.set(key, data);
        setResult({ key, data });
      })
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        console.error(error);
        setResult({ key, data: null });
      });
    return () => controller.abort();
  }, [enabled, key, attempt, lat, lon, epochMs, durationDays, distanceKm]);

  const cached = key === null ? undefined : cache.get(key);
  const data = cached ?? (result?.key === key ? result.data : undefined);

  // Views are rebuilt when the criteria change, without new requests
  const state = useMemo((): NeighboursState => {
    if (!enabled) return { status: 'idle' };
    if (data === undefined) return { status: 'loading' };
    if (data === null) return { status: 'error' };
    return {
      status: 'ready',
      rows: data.map(({ point, ephemeris, horizon }): NeighbourRow => {
        const view =
          ephemeris && horizon
            ? buildScenarioView({
                id: `${point.lat},${point.lon}`,
                siteName: '',
                epoch: new Date(epochMs),
                durationDays,
                ephemeris,
                horizon,
                criteria,
              })
            : null;
        return view
          ? { point, status: 'ready', view }
          : { point, status: 'error' };
      }),
    };
  }, [enabled, data, epochMs, durationDays, criteria]);

  return {
    state,
    calculate: () => {
      if (key === null) return;
      // After a failure: forget it and request again
      if (result?.key === key && result.data === null) {
        setResult(null);
        setAttempt((count) => count + 1);
      }
      setRequested(key);
    },
  };
}
