import {
  terrainElevationAt,
  type HorizonProfile,
} from '@/domain/horizon/horizonProfile/horizonProfile';
import {
  type BodySeries,
  type Ephemeris,
  positionAt,
  type SkyPosition,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { timeUntilSet } from '@/domain/metrics/countdowns/countdowns';
import type { Duration } from '@/types';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const TRACK_POINTS = 12;
const TRACK_MAX_DAYS = 7;

/** The sky at one moment: where the Sun and the Earth are, and when they set. */
export interface SkySnapshot {
  sun: SkyPosition;
  earth: SkyPosition;
  /** null — the body is below the horizon at this moment */
  sunset: Duration | null;
  earthset: Duration | null;
  /** Path of the body across the sky from this moment until it sets */
  sunTrack: SkyPosition[];
  earthTrack: SkyPosition[];
}

/** Path of a body across the sky from fromMs onward while it is above the terrain horizon. */
function buildTrack(
  series: BodySeries,
  ephemeris: Ephemeris,
  fromMs: number,
  spanMs: number,
  horizon: HorizonProfile
): SkyPosition[] {
  const points: SkyPosition[] = [];
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
 * The sky at any moment of the mission.
 * `visible` is the result of `maskEphemeris` (elevations counted from the terrain horizon),
 * `horizon` is the terrain profile (72 values; flat — all zeros).
 * `missionEndMs` limits the track of a body that does not set before the end of the mission.
 * Returns null if the moment is outside the range of the loaded data.
 */
export function skySnapshot(
  ephemeris: Ephemeris,
  visible: Ephemeris,
  horizon: HorizonProfile,
  ms: number,
  missionEndMs: number
): SkySnapshot | null {
  const sun = positionAt(ephemeris.sun, ephemeris, ms);
  const earth = positionAt(ephemeris.earth, ephemeris, ms);
  if (!sun || !earth) return null;

  const sunset = timeUntilSet(visible.sun, visible, ms);
  const earthset = timeUntilSet(visible.earth, visible, ms);
  const trackSpan = (set: Duration | null) =>
    set
      ? set.days * DAY_MS + set.hours * HOUR_MS
      : Math.min(TRACK_MAX_DAYS * DAY_MS, Math.max(0, missionEndMs - ms));

  return {
    sun,
    earth,
    sunset,
    earthset,
    sunTrack: buildTrack(
      ephemeris.sun,
      ephemeris,
      ms,
      trackSpan(sunset),
      horizon
    ),
    earthTrack: buildTrack(
      ephemeris.earth,
      ephemeris,
      ms,
      trackSpan(earthset),
      horizon
    ),
  };
}
