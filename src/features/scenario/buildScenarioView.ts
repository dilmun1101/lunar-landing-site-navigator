import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import {
  maskEphemeris,
  missionSegments,
} from '@/domain/criteria/missionSegments';
import { skySnapshot } from '@/domain/ephemeris/skySnapshot/skySnapshot';
import {
  endMs,
  type Ephemeris,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { msToDuration } from '@/domain/metrics/countdowns/countdowns';
import { longestGapMs } from '@/domain/metrics/gaps/gaps';
import { sunElevationStats } from '@/domain/metrics/sunElevation/sunElevation';
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import { toDaySegments, totalMs } from '@/domain/metrics/windows/windows';
import type { ScenarioView } from '@/features/scenario/demoScenario';

const DAY_MS = 86_400_000;

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
  const darknessMs = longestGapMs(sunSegments, fromMs, toMs);
  const blackoutExceeded =
    criteria.maxBlackoutHours > 0 &&
    darknessMs > criteria.maxBlackoutHours * 3_600_000;

  const sky = skySnapshot(ephemeris, visible, horizon, fromMs, toMs);
  if (!sky) return null;

  return {
    id,
    siteName,
    epoch,
    durationDays,
    // The lander does not survive a darkness longer than its battery allows
    verdict: blackoutExceeded
      ? 'not-viable'
      : verdictFor(windowPercent, criteria),
    sunlightPercent: percentOf(sunSegments),
    earthLinkPercent: percentOf(earthSegments),
    windowPercent,
    sunlightDuration: msToDuration(totalMs(sunSegments)),
    earthWindowDuration: msToDuration(totalMs(earthSegments)),
    longestDarkness: msToDuration(darknessMs),
    longestCommsGap: msToDuration(longestGapMs(earthSegments, fromMs, toMs)),
    blackoutExceeded,
    sunElevation: sunElevationStats(
      ephemeris,
      visible,
      fromMs,
      toMs,
      criteria.minSunElevation
    ),
    sunset: sky.sunset,
    earthset: sky.earthset,
    sun: sky.sun,
    earth: sky.earth,
    sunSegments: toDaySegments(sunSegments, fromMs),
    earthSegments: toDaySegments(earthSegments, fromMs),
    windowSegments: toDaySegments(windowSegments, fromMs),
    sunTrack: sky.sunTrack,
    earthTrack: sky.earthTrack,
    // The chart draws terrain above the geometric horizon only
    horizon: horizon.map((elevation) => Math.max(0, elevation)),
  };
}
