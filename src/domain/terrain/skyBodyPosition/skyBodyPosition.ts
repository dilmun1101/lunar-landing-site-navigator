/** Position in the terrain scene: x east, y up, z south (km). */
export type ScenePoint = [number, number, number];

const DEG = Math.PI / 180;

/**
 * Where to put a body of the sky in the terrain scene: in the direction given by
 * azimuth (degrees clockwise from north) and elevation, at the given distance from the site.
 */
export function skyBodyPosition(
  azimuth: number,
  elevation: number,
  distanceKm: number
): ScenePoint {
  const az = azimuth * DEG;
  const el = elevation * DEG;
  return [
    Math.cos(el) * Math.sin(az) * distanceKm,
    Math.sin(el) * distanceKm,
    -Math.cos(el) * Math.cos(az) * distanceKm,
  ];
}
