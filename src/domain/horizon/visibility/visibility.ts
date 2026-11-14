import type { BodySeries } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  type HorizonProfile,
  terrainElevationAt,
} from '@/domain/horizon/horizonProfile/horizonProfile';

/**
 * Elevation of the body above the terrain horizon: elevation minus the horizon height at the
 * body's azimuth. A positive value means the body is visible. Pass the result to `aboveHorizon`
 * with the default threshold of 0°.
 */
export function maskByTerrain(
  series: BodySeries,
  profile: HorizonProfile
): BodySeries {
  return {
    az: series.az,
    el: series.el.map(
      (elevation, index) =>
        elevation - terrainElevationAt(profile, series.az[index] ?? 0)
    ),
  };
}
