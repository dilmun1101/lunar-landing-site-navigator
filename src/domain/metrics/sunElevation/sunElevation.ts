import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

/** How high the Sun stands during the mission: it decides how much power solar panels give. */
export interface SunElevationStats {
  /** The highest elevation above the geometric horizon, degrees */
  max: number;
  /** The average elevation while the Sun is visible; null — the Sun is never visible */
  meanLit: number | null;
}

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Elevation of the Sun over the mission [fromMs, toMs], from the samples of the ephemeris.
 * `ephemeris` gives the elevation above the geometric horizon, `visible` (from `maskEphemeris`)
 * tells when the Sun is above the terrain; `minVisible` is the criterion for "lit", degrees.
 * Returns null if no sample falls into the mission.
 */
export function sunElevationStats(
  ephemeris: Ephemeris,
  visible: Ephemeris,
  fromMs: number,
  toMs: number,
  minVisible = 0
): SunElevationStats | null {
  const first = Math.max(
    0,
    Math.ceil((fromMs - ephemeris.startMs) / ephemeris.stepMs)
  );
  const last = Math.min(
    ephemeris.sun.el.length - 1,
    Math.floor((toMs - ephemeris.startMs) / ephemeris.stepMs)
  );

  let max = -Infinity;
  let litSum = 0;
  let litCount = 0;
  for (let index = first; index <= last; index++) {
    const elevation = ephemeris.sun.el[index];
    if (elevation === undefined) continue;
    if (elevation > max) max = elevation;
    if ((visible.sun.el[index] ?? -Infinity) > minVisible) {
      litSum += elevation;
      litCount++;
    }
  }
  if (max === -Infinity) return null;
  return {
    max: round(max),
    meanLit: litCount > 0 ? round(litSum / litCount) : null,
  };
}
