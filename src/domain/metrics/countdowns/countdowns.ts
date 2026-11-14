import {
  type BodySeries,
  endMs,
  positionAt,
  type Timeline,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { aboveHorizon } from '@/domain/metrics/windows/windows';
import type { Duration } from '@/types';

export function msToDuration(ms: number): Duration {
  const hours = Math.floor(ms / 3_600_000);
  return { days: Math.floor(hours / 24), hours: hours % 24 };
}

/**
 * How long the body stays above the horizon from fromMs.
 * null — the body is currently below the horizon (or the moment is outside the data).
 * If it does not set before the end of the data, the time until the end of the data is returned.
 */
export function timeUntilSet(
  series: BodySeries,
  timeline: Timeline,
  fromMs: number
): Duration | null {
  const now = positionAt(series, timeline, fromMs);
  if (!now || now.elevation <= 0) return null;
  const [segment] = aboveHorizon(
    series,
    timeline,
    fromMs,
    endMs(timeline, series)
  );
  if (!segment || segment[0] > fromMs) return null;
  return msToDuration(segment[1] - fromMs);
}
