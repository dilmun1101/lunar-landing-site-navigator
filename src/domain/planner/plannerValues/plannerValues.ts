import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import {
  maskEphemeris,
  missionSegments,
} from '@/domain/criteria/missionSegments';
import {
  endMs,
  type Ephemeris,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { totalMs } from '@/domain/metrics/windows/windows';

/** sunlight — Sun visible, comms — Earth visible, window — both at the same time. */
export type PlannerMetric = 'sunlight' | 'comms' | 'window';

/** values[metric][dateIndex] — percent of the mission, 0–100 */
export type PlannerValues = Record<PlannerMetric, number[]>;

const DAY_MS = 86_400_000;

export const PLANNER_COLUMNS = 26;
export const PLANNER_STEP_DAYS = 14;

/** Start times of the missions shown as columns of the planner. */
export const plannerStarts = (firstMs: number): number[] =>
  Array.from(
    { length: PLANNER_COLUMNS },
    (_, index) => firstMs + index * PLANNER_STEP_DAYS * DAY_MS
  );

/** How many days of ephemeris cover every column. */
export const plannerSpanDays = (missionDays: number): number =>
  (PLANNER_COLUMNS - 1) * PLANNER_STEP_DAYS + missionDays;

/**
 * For every start time, the share of the mission (percent) during which the Sun, the Earth and
 * both together satisfy the criteria. Without a terrain profile the horizon is flat (0°).
 * Throws if the ephemeris does not cover a mission.
 */
export function computePlannerValues(
  ephemeris: Ephemeris,
  terrain: number[] | null,
  startsMs: number[],
  missionDays: number,
  criteria: Criteria = defaultCriteria
): PlannerValues {
  const visible = maskEphemeris(ephemeris, terrain);
  const missionMs = missionDays * DAY_MS;
  const lastMs = Math.min(
    endMs(ephemeris, ephemeris.sun),
    endMs(ephemeris, ephemeris.earth)
  );
  const percentOf = (ms: number) =>
    Math.min(100, Math.round((ms / missionMs) * 100));

  const values: PlannerValues = { sunlight: [], comms: [], window: [] };
  for (const fromMs of startsMs) {
    const toMs = fromMs + missionMs;
    if (fromMs < ephemeris.startMs || toMs > lastMs) {
      throw new Error('Planner: the ephemeris does not cover the mission');
    }
    const segments = missionSegments(visible, fromMs, toMs, criteria);
    values.sunlight.push(percentOf(totalMs(segments.sun)));
    values.comms.push(percentOf(totalMs(segments.earth)));
    values.window.push(percentOf(totalMs(segments.window)));
  }
  return values;
}
