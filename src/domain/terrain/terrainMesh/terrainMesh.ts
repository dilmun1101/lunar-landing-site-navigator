import type { TerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';

/** Ready-to-draw triangles of a terrain patch. Units are km. */
export interface TerrainMesh {
  /** x, y, z per vertex: x east, y up, z south (so north is "into the screen") */
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

/**
 * Turns the grid into a mesh. `exaggeration` stretches the heights: a 40 km patch of
 * the Moon with 1-3 km of relief looks flat otherwise.
 * Normals come from differences between neighbouring heights, so there are no seams.
 */
export function terrainMesh(grid: TerrainGrid, exaggeration = 1): TerrainMesh {
  const { size, radiusKm, heights } = grid;
  const step = (2 * radiusKm) / (size - 1);
  const height = (row: number, column: number) =>
    (heights[row * size + column] ?? 0) * exaggeration;

  const positions = new Float32Array(size * size * 3);
  const normals = new Float32Array(size * size * 3);

  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const at = (row * size + column) * 3;
      positions[at] = -radiusKm + column * step;
      positions[at + 1] = height(row, column);
      positions[at + 2] = -radiusKm + row * step;

      // Slope toward the east and toward the south (one-sided at the edges)
      const west = Math.max(column - 1, 0);
      const east = Math.min(column + 1, size - 1);
      const north = Math.max(row - 1, 0);
      const south = Math.min(row + 1, size - 1);
      const slopeEast =
        (height(row, east) - height(row, west)) / ((east - west) * step);
      const slopeSouth =
        (height(south, column) - height(north, column)) /
        ((south - north) * step);

      const length = Math.hypot(slopeEast, 1, slopeSouth);
      normals[at] = -slopeEast / length;
      normals[at + 1] = 1 / length;
      normals[at + 2] = -slopeSouth / length;
    }
  }

  const cells = size - 1;
  const indices = new Uint32Array(cells * cells * 6);
  let cursor = 0;
  for (let row = 0; row < cells; row++) {
    for (let column = 0; column < cells; column++) {
      const a = row * size + column; // north-west
      const b = a + 1; // north-east
      const c = a + size; // south-west
      const d = c + 1; // south-east
      // Counter-clockwise seen from above: the faces point up
      indices.set([a, c, b, b, c, d], cursor);
      cursor += 6;
    }
  }
  return { positions, normals, indices };
}
