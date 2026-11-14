import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import {
  maskEphemeris,
  missionSegments,
} from '@/domain/criteria/missionSegments';
import {
  type BodySeries,
  endMs,
  type Ephemeris,
  positionAt,
  type SkyPosition,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  msToDuration,
  timeUntilSet,
} from '@/domain/metrics/countdowns/countdowns';
import { terrainElevationAt } from '@/domain/horizon/horizonProfile/horizonProfile';
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import { toDaySegments, totalMs } from '@/domain/metrics/windows/windows';
import type { ScenarioView, SkyPoint } from '@/features/scenario/demoScenario';

const DAY_MS = 86_400_000;
const TRACK_POINTS = 12;
const TRACK_MAX_DAYS = 7;

export interface ScenarioInput {
  id: string;
  siteName: string;
  epoch: Date;
  durationDays: number;
  ephemeris: Ephemeris;
  /** Terrain horizon (5° azimuth step); null or omitted — flat horizon */
  horizon?: number[] | null;
  /** Suitability criteria; the defaults are used if omitted */
  criteria?: Criteria;
}

/** Path of a body across the sky from fromMs onward while it is above the terrain horizon. */
function buildTrack(
  series: BodySeries,
  ephemeris: Ephemeris,
  fromMs: number,
  spanMs: number,
  horizon: number[]
): SkyPoint[] {
  const points: SkyPoint[] = [];
  for (let step = 0; step <= TRACK_POINTS; step++) {
    const position = positionAt(
      series,
      ephemeris,
      fromMs + (spanMs * step) / TRACK_POINTS
    );
    if (
      !position ||
      position.elevation < terrainElevationAt(horizon, position.azimuth)
    ) {
      break;
    }
    points.push(position);
  }
  return points;
}

/**
 * Builds everything the page shows from Horizons data.
 * Returns null if the mission does not fit into the range of the loaded data.
 * Visibility is checked against the terrain horizon (LOLA); without it the horizon is flat (0°).
 */
export function buildScenarioView({
  id,
  siteName,
  epoch,
  durationDays,
  ephemeris,
  horizon: terrain,
  criteria = defaultCriteria,
}: ScenarioInput): ScenarioView | null {
  const fromMs = epoch.getTime();
  const toMs = fromMs + durationDays * DAY_MS;
  if (fromMs < ephemeris.startMs || toMs > endMs(ephemeris, ephemeris.sun)) {
    return null;
  }

  const horizon = terrain ?? Array.from({ length: 72 }, () => 0);
  // Elevation above the terrain: positive means the body is visible
  const visible = maskEphemeris(ephemeris, terrain ?? null);
  const {
    sun: sunSegments,
    earth: earthSegments,
    window: windowSegments,
  } = missionSegments(visible, fromMs, toMs, criteria);

  const percentOf = (segments: [number, number][]) =>
    Math.round((totalMs(segments) / (toMs - fromMs)) * 100);
  const windowPercent = percentOf(windowSegments);

  const sunSet = timeUntilSet(visible.sun, visible, fromMs);
  const earthSet = timeUntilSet(visible.earth, visible, fromMs);
  const trackSpan = (set: ReturnType<typeof timeUntilSet>) =>
    set
      ? set.days * DAY_MS + set.hours * 3_600_000
      : Math.min(TRACK_MAX_DAYS * DAY_MS, toMs - fromMs);

  const sun: SkyPosition = positionAt(ephemeris.sun, ephemeris, fromMs)!;
  const earth: SkyPosition = positionAt(ephemeris.earth, ephemeris, fromMs)!;

  return {
    id,
    siteName,
    epoch,
    durationDays,
    verdict: verdictFor(windowPercent, criteria),
    sunlightPercent: percentOf(sunSegments),
    earthLinkPercent: percentOf(earthSegments),
    windowPercent,
    sunlightDuration: msToDuration(totalMs(sunSegments)),
    earthWindowDuration: msToDuration(totalMs(earthSegments)),
    sunset: sunSet,
    earthset: earthSet,
    sun,
    earth,
    sunSegments: toDaySegments(sunSegments, fromMs),
    earthSegments: toDaySegments(earthSegments, fromMs),
    windowSegments: toDaySegments(windowSegments, fromMs),
    sunTrack: buildTrack(
      ephemeris.sun,
      ephemeris,
      fromMs,
      trackSpan(sunSet),
      horizon
    ),
    earthTrack: buildTrack(
      ephemeris.earth,
      ephemeris,
      fromMs,
      trackSpan(earthSet),
      horizon
    ),
    // The chart draws terrain above the geometric horizon only
    horizon: horizon.map((elevation) => Math.max(0, elevation)),
  };
}
