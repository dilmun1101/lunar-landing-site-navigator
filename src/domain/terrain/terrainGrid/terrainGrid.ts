import {
  destination,
  MOON_RADIUS_KM,
  type ElevationModel,
} from '@/domain/horizon/terrainHorizon/terrainHorizon';

/** A square patch of terrain around a site, for the 3D view. */
export interface TerrainGrid {
  /** Points per side */
  size: number;
  /** Half-width of the patch, km: east and north run from -radiusKm to +radiusKm */
  radiusKm: number;
  /**
   * size * size heights, km above the plane that touches the Moon at the site
   * (the Moon's curvature is included, so far terrain drops away).
   * Row 0 is the north edge, column 0 is the west edge.
   */
  heights: Float32Array;
  /** Height of the ground at the site above the reference sphere, km */
  groundKm: number;
}

export interface TerrainGridOptions {
  radiusKm?: number;
  size?: number;
  /** false — heights relative to the ground level at the site, no curvature (for tests and flat views) */
  curvature?: boolean;
}

/**
 * Samples an elevation model on a square grid around the site.
 * Returns null if the model has no data at the site itself.
 * Cells without data take the height of the ground at the site.
 */
export function buildTerrainGrid(
  model: ElevationModel,
  site: { lat: number; lon: number },
  { radiusKm = 20, size = 129, curvature = true }: TerrainGridOptions = {}
): TerrainGrid | null {
  const groundKm = model.heightAt(site.lat, site.lon);
  if (groundKm === null) return null;

  const heights = new Float32Array(size * size);
  const step = (2 * radiusKm) / (size - 1);

  for (let row = 0; row < size; row++) {
    const north = radiusKm - row * step;
    for (let column = 0; column < size; column++) {
      const east = -radiusKm + column * step;
      const distance = Math.hypot(east, north);
      const angle = distance / MOON_RADIUS_KM;

      let height = groundKm;
      if (distance > 0) {
        const bearing = (Math.atan2(east, north) * 180) / Math.PI;
        const point = destination(site.lat, site.lon, bearing, angle);
        height = model.heightAt(point.lat, point.lon) ?? groundKm;
      }

      heights[row * size + column] = curvature
        ? (MOON_RADIUS_KM + height) * Math.cos(angle) -
          (MOON_RADIUS_KM + groundKm)
        : height - groundKm;
    }
  }
  return { size, radiusKm, heights, groundKm };
}
