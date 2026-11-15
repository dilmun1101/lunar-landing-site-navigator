import { describe, expect, it } from 'vitest';
import { parseElevationTiff } from '@/lib/lola/parseElevationTiff/parseElevationTiff';

/** Minimal little-endian TIFF: 16-bit, uncompressed, one row per strip. */
function makeTiff(width: number, height: number, values: number[]) {
  const entries = 6;
  const ifdSize = 2 + entries * 12 + 4;
  const stripTable = 8 + ifdSize;
  const dataStart = stripTable + height * 4;
  const buffer = new ArrayBuffer(dataStart + values.length * 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0x4949, false);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, entries, true);
  const entry = (
    index: number,
    tag: number,
    type: number,
    count: number,
    value: number
  ) => {
    const at = 10 + index * 12;
    view.setUint16(at, tag, true);
    view.setUint16(at + 2, type, true);
    view.setUint32(at + 4, count, true);
    if (type === 3) view.setUint16(at + 8, value, true);
    else view.setUint32(at + 8, value, true);
  };
  entry(0, 256, 3, 1, width);
  entry(1, 257, 3, 1, height);
  entry(2, 258, 3, 1, 16);
  entry(3, 259, 3, 1, 1);
  entry(4, 273, 4, height, stripTable);
  entry(5, 278, 3, 1, 1);
  for (let row = 0; row < height; row++) {
    view.setUint32(stripTable + row * 4, dataStart + row * width * 2, true);
  }
  values.forEach((value, index) =>
    view.setInt16(dataStart + index * 2, value, true)
  );
  return buffer;
}

describe('parseElevationTiff', () => {
  it('reads signed 16-bit values row by row', () => {
    const raster = parseElevationTiff(
      makeTiff(3, 2, [-5000, 0, 7000, 1, -2, 3])
    );
    expect(raster.width).toBe(3);
    expect(raster.height).toBe(2);
    expect(Array.from(raster.data)).toEqual([-5000, 0, 7000, 1, -2, 3]);
  });

  it('rejects data that is not a TIFF', () => {
    const xml = new TextEncoder().encode('<?xml version="1.0"?>').buffer;
    expect(() => parseElevationTiff(xml)).toThrow();
  });
});
