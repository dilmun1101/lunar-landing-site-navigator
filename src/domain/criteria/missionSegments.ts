import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import type { Criteria } from '@/domain/criteria/criteria';
import { maskByTerrain } from '@/domain/horizon/visibility/visibility';
import {
  aboveHorizon,
  intersect,
  type MsSegment,
} from '@/domain/metrics/windows/windows';

const HOUR_MS = 3_600_000;

/**
 * Ephemeris whose elevations are counted from the terrain horizon: a positive value means that
 * the body is visible. Without a terrain profile the horizon is flat and nothing changes.
 */
export function maskEphemeris(
  ephemeris: Ephemeris,
  terrain: number[] | null
): Ephemeris {
  if (!terrain) return ephemeris;
  return {
    ...ephemeris,
    sun: maskByTerrain(ephemeris.sun, terrain),
    earth: maskByTerrain(ephemeris.earth, terrain),
  };
}

export interface MissionSegments {
  sun: MsSegment[];
  earth: MsSegment[];
  /** Sun and Earth together, without the periods shorter than the minimum */
  window: MsSegment[];
}

/**
 * When the Sun, the Earth and both together satisfy the criteria within [fromMs, toMs].
 * `visible` is the result of `maskEphemeris`.
 */
export function missionSegments(
  visible: Ephemeris,
  fromMs: number,
  toMs: number,
  criteria: Criteria
): MissionSegments {
  const sun = aboveHorizon(
    visible.sun,
    visible,
    fromMs,
    toMs,
    criteria.minSunElevation
  );
  const earth = aboveHorizon(
    visible.earth,
    visible,
    fromMs,
    toMs,
    criteria.minEarthElevation
  );
  const minMs = criteria.minWindowHours * HOUR_MS;
  const window = intersect(sun, earth).filter(
    ([start, end]) => end - start >= minMs
  );
  return { sun, earth, window };
}
