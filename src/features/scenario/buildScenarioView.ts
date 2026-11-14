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
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import {
  aboveHorizon,
  intersect,
  toDaySegments,
  totalMs,
} from '@/domain/metrics/windows/windows';
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
}

/** Path of a body across the sky from fromMs onward while it is above the horizon. */
function buildTrack(
  series: BodySeries,
  ephemeris: Ephemeris,
  fromMs: number,
  spanMs: number
): SkyPoint[] {
  const points: SkyPoint[] = [];
  for (let step = 0; step <= TRACK_POINTS; step++) {
    const position = positionAt(
      series,
      ephemeris,
      fromMs + (spanMs * step) / TRACK_POINTS
    );
    if (!position || position.elevation < 0) break;
    points.push(position);
  }
  return points;
}

/**
 * Builds everything the page shows from Horizons data.
 * Returns null if the mission does not fit into the range of the loaded data.
 * Terrain is not taken into account yet: the horizon is flat (0°).
 */
export function buildScenarioView({
  id,
  siteName,
  epoch,
  durationDays,
  ephemeris,
}: ScenarioInput): ScenarioView | null {
  const fromMs = epoch.getTime();
  const toMs = fromMs + durationDays * DAY_MS;
  if (fromMs < ephemeris.startMs || toMs > endMs(ephemeris, ephemeris.sun)) {
    return null;
  }

  const sunSegments = aboveHorizon(ephemeris.sun, ephemeris, fromMs, toMs);
  const earthSegments = aboveHorizon(ephemeris.earth, ephemeris, fromMs, toMs);
  const windowSegments = intersect(sunSegments, earthSegments);

  const percentOf = (segments: [number, number][]) =>
    Math.round((totalMs(segments) / (toMs - fromMs)) * 100);
  const windowPercent = percentOf(windowSegments);

  const sunSet = timeUntilSet(ephemeris.sun, ephemeris, fromMs);
  const earthSet = timeUntilSet(ephemeris.earth, ephemeris, fromMs);
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
    verdict: verdictFor(windowPercent),
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
    sunTrack: buildTrack(ephemeris.sun, ephemeris, fromMs, trackSpan(sunSet)),
    earthTrack: buildTrack(
      ephemeris.earth,
      ephemeris,
      fromMs,
      trackSpan(earthSet)
    ),
    horizon: Array.from({ length: 72 }, () => 0),
  };
}
