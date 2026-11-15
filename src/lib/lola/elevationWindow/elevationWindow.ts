import type { ElevationModel } from '@/domain/horizon/terrainHorizon/terrainHorizon';
import type { ElevationRaster } from '@/lib/lola/parseElevationTiff/parseElevationTiff';

/** A raster with its geographic bounds (degrees). */
export interface ElevationTile extends ElevationRaster {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Bilinear elevation model over one or more tiles; heights are returned in km. */
export function createElevationModel(tiles: ElevationTile[]): ElevationModel {
  return {
    heightAt(latDeg, lonDeg) {
      // Normalize the longitude to [-180, 180)
      const lon = ((((lonDeg + 180) % 360) + 360) % 360) - 180;
      const tile = tiles.find(
        (candidate) =>
          lon >= candidate.west &&
          lon <= candidate.east &&
          latDeg >= candidate.south &&
          latDeg <= candidate.north
      );
      if (!tile) return null;

      // Pixel centers lie at half-integers of the outer-edge coordinates
      const x =
        ((lon - tile.west) / (tile.east - tile.west)) * tile.width - 0.5;
      const y =
        ((tile.north - latDeg) / (tile.north - tile.south)) * tile.height - 0.5;
      const x0 = Math.min(Math.max(Math.floor(x), 0), tile.width - 2);
      const y0 = Math.min(Math.max(Math.floor(y), 0), tile.height - 2);
      const fx = Math.min(Math.max(x - x0, 0), 1);
      const fy = Math.min(Math.max(y - y0, 0), 1);

      const at = (column: number, row: number) =>
        tile.data[row * tile.width + column] ?? 0;
      const meters =
        at(x0, y0) * (1 - fx) * (1 - fy) +
        at(x0 + 1, y0) * fx * (1 - fy) +
        at(x0, y0 + 1) * (1 - fx) * fy +
        at(x0 + 1, y0 + 1) * fx * fy;
      return meters / 1000;
    },
  };
}
