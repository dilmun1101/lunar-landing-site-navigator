import { describe, expect, it } from 'vitest';
import {
  RELIEF_HIGH_M,
  RELIEF_LOW_M,
  reliefPixels,
} from '@/domain/globe/reliefTexture/reliefTexture';

const raster = (width: number, height: number, fill = 0) => ({
  width,
  height,
  data: new Int16Array(width * height).fill(fill),
});

const grayAt = (pixels: Uint8Array, width: number, row: number, col: number) =>
  pixels[(row * width + col) * 4];

describe('reliefPixels', () => {
  it('returns opaque grey RGBA pixels', () => {
    const pixels = reliefPixels(raster(4, 2), 0, 255);
    expect(pixels.length).toBe(4 * 2 * 4);
    expect(pixels[3]).toBe(255);
    expect(pixels[0]).toBe(pixels[1]);
    expect(pixels[1]).toBe(pixels[2]);
  });

  it('maps the lowest and the highest heights to the gray range', () => {
    expect(
      grayAt(reliefPixels(raster(4, 2, RELIEF_LOW_M), 40, 200), 4, 0, 0)
    ).toBe(40);
    expect(
      grayAt(reliefPixels(raster(4, 2, RELIEF_HIGH_M), 40, 200), 4, 0, 0)
    ).toBe(200);
  });

  it('clamps heights outside the range', () => {
    expect(grayAt(reliefPixels(raster(4, 2, 30000), 0, 255), 4, 0, 0)).toBe(
      255
    );
    expect(grayAt(reliefPixels(raster(4, 2, -30000), 0, 255), 4, 0, 0)).toBe(0);
  });

  it('puts the north row last (texture rows grow upward)', () => {
    const source = raster(4, 3);
    source.data[0] = RELIEF_HIGH_M; // north row, column 0
    const pixels = reliefPixels(source, 0, 255);
    const sourceColumn = 0;
    const destColumn = (((sourceColumn - 1) % 4) + 4) % 4; // shift = width / 4 = 1
    expect(grayAt(pixels, 4, 2, destColumn)).toBe(255);
    expect(grayAt(pixels, 4, 0, destColumn)).not.toBe(255);
  });

  it('puts longitude 0 at a quarter of the width', () => {
    const width = 8;
    const source = raster(width, 2);
    source.data[width / 2] = RELIEF_HIGH_M; // longitude 0 is the middle column
    const pixels = reliefPixels(source, 0, 255);
    expect(grayAt(pixels, width, 1, width / 4)).toBe(255);
  });
});
