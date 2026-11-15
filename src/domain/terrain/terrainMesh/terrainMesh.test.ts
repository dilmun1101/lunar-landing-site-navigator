import { describe, expect, it } from 'vitest';
import type { TerrainGrid } from '@/domain/terrain/terrainGrid/terrainGrid';
import { terrainMesh } from '@/domain/terrain/terrainMesh/terrainMesh';

const grid = (
  size: number,
  heightAt: (row: number, column: number) => number
) => {
  const heights = new Float32Array(size * size);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      heights[row * size + column] = heightAt(row, column);
    }
  }
  return { size, radiusKm: 10, heights, groundKm: 0 } satisfies TerrainGrid;
};

describe('terrainMesh', () => {
  it('has the right number of vertices and triangles', () => {
    const mesh = terrainMesh(grid(5, () => 0));
    expect(mesh.positions.length).toBe(5 * 5 * 3);
    expect(mesh.normals.length).toBe(5 * 5 * 3);
    expect(mesh.indices.length).toBe(4 * 4 * 6);
  });

  it('puts the north-west corner at (-R, h, -R) and the south-east at (R, h, R)', () => {
    const mesh = terrainMesh(grid(5, () => 0));
    expect(mesh.positions[0]).toBeCloseTo(-10, 6);
    expect(mesh.positions[2]).toBeCloseTo(-10, 6);
    const last = (5 * 5 - 1) * 3;
    expect(mesh.positions[last]).toBeCloseTo(10, 6);
    expect(mesh.positions[last + 2]).toBeCloseTo(10, 6);
  });

  it('scales heights by the exaggeration', () => {
    const mesh = terrainMesh(
      grid(3, () => 0.5),
      4
    );
    expect(mesh.positions[1]).toBeCloseTo(2, 6);
  });

  it('has normals straight up on flat ground', () => {
    const mesh = terrainMesh(grid(5, () => 1));
    for (let vertex = 0; vertex < 25; vertex++) {
      expect(mesh.normals[vertex * 3]).toBeCloseTo(0, 6);
      expect(mesh.normals[vertex * 3 + 1]).toBeCloseTo(1, 6);
      expect(mesh.normals[vertex * 3 + 2]).toBeCloseTo(0, 6);
    }
  });

  it('tilts normals away from a slope that rises to the east', () => {
    // Height grows with the column, i.e. toward the east
    const mesh = terrainMesh(grid(5, (_row, column) => column * 0.5));
    const middle = (2 * 5 + 2) * 3;
    expect(mesh.normals[middle]).toBeLessThan(0); // leans west
    expect(mesh.normals[middle + 2]).toBeCloseTo(0, 6);
  });

  it('tilts normals toward the north when the ground rises to the south', () => {
    // Height grows with the row, i.e. toward the south
    const mesh = terrainMesh(grid(5, (row) => row * 0.5));
    const middle = (2 * 5 + 2) * 3;
    expect(mesh.normals[middle + 2]).toBeLessThan(0); // leans north
  });

  it('winds every triangle counter-clockwise seen from above', () => {
    const mesh = terrainMesh(grid(4, () => 0));
    for (let t = 0; t < mesh.indices.length; t += 3) {
      const [i, j, k] = [
        mesh.indices[t],
        mesh.indices[t + 1],
        mesh.indices[t + 2],
      ] as [number, number, number];
      const p = (v: number) =>
        [mesh.positions[v * 3], mesh.positions[v * 3 + 2]] as [number, number];
      const [ax, az] = p(i);
      const [bx, bz] = p(j);
      const [cx, cz] = p(k);
      // y component of (b - a) x (c - a) is (bz-az)*(cx-ax) - (bx-ax)*(cz-az) with this axis order
      const cross = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
      expect(cross).toBeGreaterThan(0);
    }
  });
});
