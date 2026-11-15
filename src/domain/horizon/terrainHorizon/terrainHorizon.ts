export const MOON_RADIUS_KM = 1737.4;

/** Terrain heights: kilometers above the reference sphere of 1737.4 km. */
export interface ElevationModel {
  /** null — no data at the point */
  heightAt: (latDeg: number, lonDeg: number) => number | null;
}

export interface TerrainHorizonOptions {
  /** How far to look for terrain, km */
  maxKm?: number;
  /** Observer height above the ground, km */
  observerHeightKm?: number;
  /** Smallest distance step along a ray, km */
  minStepKm?: number;
  /** Azimuth step of the profile, degrees */
  azimuthStepDeg?: number;
}

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const deg = (radians: number) => (radians * 180) / Math.PI;

/** The point reached from (lat, lon) along the bearing after the given angular distance. */
function destination(
  latDeg: number,
  lonDeg: number,
  bearingDeg: number,
  angle: number
) {
  const lat1 = rad(latDeg);
  const bearing = rad(bearingDeg);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angle) +
      Math.cos(lat1) * Math.sin(angle) * Math.cos(bearing)
  );
  const lon2 =
    rad(lonDeg) +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angle) * Math.cos(lat1),
      Math.cos(angle) - Math.sin(lat1) * Math.sin(lat2)
    );
  return { lat: deg(lat2), lon: deg(lon2) };
}

/**
 * Terrain horizon of a point: for each azimuth (0°, 5°, … clockwise from north) the highest
 * elevation angle of the surface seen from the observer, in degrees. Lunar curvature is included.
 * Returns null if the model has no data at the observer's position.
 */
export function computeTerrainHorizon(
  model: ElevationModel,
  site: { lat: number; lon: number },
  {
    maxKm = 120,
    observerHeightKm = 0.002,
    minStepKm = 0.1,
    azimuthStepDeg = 5,
  }: TerrainHorizonOptions = {}
): number[] | null {
  const ground = model.heightAt(site.lat, site.lon);
  if (ground === null) return null;
  const observerRadius = MOON_RADIUS_KM + ground + observerHeightKm;

  const profile: number[] = [];
  for (let azimuth = 0; azimuth < 360; azimuth += azimuthStepDeg) {
    let best = -Math.PI / 2;
    // The step grows with the distance: far terrain does not need a fine step
    for (
      let distance = minStepKm;
      distance <= maxKm;
      distance += Math.max(minStepKm, distance * 0.005)
    ) {
      const angle = distance / MOON_RADIUS_KM;
      const point = destination(site.lat, site.lon, azimuth, angle);
      const height = model.heightAt(point.lat, point.lon);
      if (height === null) break;
      const radius = MOON_RADIUS_KM + height;
      const elevation = Math.atan2(
        radius * Math.cos(angle) - observerRadius,
        radius * Math.sin(angle)
      );
      if (elevation > best) best = elevation;
    }
    profile.push(Math.round(deg(best) * 10) / 10);
  }
  return profile;
}
