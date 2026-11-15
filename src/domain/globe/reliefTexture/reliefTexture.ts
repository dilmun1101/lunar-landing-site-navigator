/** Elevation raster: row by row from the north, columns from longitude -180 */
export interface ReliefRaster {
  width: number;
  height: number;
  /** Meters above the reference sphere */
  data: Int16Array;
}

/** The range of lunar heights (LOLA): about -9.1 km (the South Pole - Aitken basin) to +10.8 km. */
export const RELIEF_LOW_M = -9000;
export const RELIEF_HIGH_M = 11000;

/**
 * Grey RGBA pixels of a height map, laid out for a three.js SphereGeometry:
 * - the north is the last row (texture rows grow upward);
 * - column 0 is longitude -90 (the sphere starts at the -X side), so the columns
 *   are shifted by a quarter of the width.
 * Heights map linearly onto [lowGray, highGray].
 */
export function reliefPixels(
  raster: ReliefRaster,
  lowGray: number,
  highGray: number
): Uint8Array {
  const { width, height, data } = raster;
  const out = new Uint8Array(width * height * 4);
  const shift = Math.floor(width / 4);
  const span = RELIEF_HIGH_M - RELIEF_LOW_M;

  for (let row = 0; row < height; row++) {
    const destRow = height - 1 - row;
    for (let column = 0; column < width; column++) {
      const destColumn = (((column - shift) % width) + width) % width;
      const meters = data[row * width + column] ?? 0;
      const t = Math.min(1, Math.max(0, (meters - RELIEF_LOW_M) / span));
      const gray = Math.round(lowGray + t * (highGray - lowGray));
      const at = (destRow * width + destColumn) * 4;
      out[at] = gray;
      out[at + 1] = gray;
      out[at + 2] = gray;
      out[at + 3] = 255;
    }
  }
  return out;
}
