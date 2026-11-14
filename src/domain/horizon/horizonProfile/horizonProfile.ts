/** Terrain horizon: elevation angles (degrees) every 5° of azimuth, starting from north. */
export type HorizonProfile = number[];

/** Elevation of the terrain horizon at the azimuth (linear interpolation, wraps around 360°). */
export function terrainElevationAt(
  profile: HorizonProfile,
  azimuth: number
): number {
  const count = profile.length;
  if (count === 0) return 0;
  const position = ((((azimuth / 360) * count) % count) + count) % count;
  const lower = Math.floor(position);
  const fraction = position - lower;
  const a = profile[lower] ?? 0;
  const b = profile[(lower + 1) % count] ?? a;
  return a + (b - a) * fraction;
}
