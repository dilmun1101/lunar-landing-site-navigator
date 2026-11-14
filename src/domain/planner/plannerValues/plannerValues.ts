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

/** Step of the search for the best start, 12 hours. */
const BEST_STEP_MS = 12 * 3_600_000;

export interface BestStart {
  startMs: number;
  /** Share of the mission by the chosen metric, percent */
  percent: number;
}

/**
 * The start time in [firstMs, lastMs] with the largest share of the mission by the metric
 * (checked every 12 hours; the earliest one if several are equally good).
 * Returns null if no mission starting in the range fits into the ephemeris.
 */
export function findBestStart(
  ephemeris: Ephemeris,
  terrain: number[] | null,
  metric: PlannerMetric,
  firstMs: number,
  lastMs: number,
  missionDays: number,
  criteria: Criteria = defaultCriteria
): BestStart | null {
  const visible = maskEphemeris(ephemeris, terrain);
  const missionMs = missionDays * DAY_MS;
  const dataEnd = Math.min(
    endMs(ephemeris, ephemeris.sun),
    endMs(ephemeris, ephemeris.earth)
  );

  let best: { startMs: number; ms: number } | null = null;
  for (
    let startMs = Math.max(firstMs, ephemeris.startMs);
    startMs <= lastMs && startMs + missionMs <= dataEnd;
    startMs += BEST_STEP_MS
  ) {
    const segments = missionSegments(
      visible,
      startMs,
      startMs + missionMs,
      criteria
    );
    const ms = totalMs(
      metric === 'sunlight'
        ? segments.sun
        : metric === 'comms'
          ? segments.earth
          : segments.window
    );
    if (!best || ms > best.ms) best = { startMs, ms };
  }
  return best
    ? {
        startMs: best.startMs,
        percent: Math.min(100, Math.round((best.ms / missionMs) * 100)),
      }
    : null;
}
