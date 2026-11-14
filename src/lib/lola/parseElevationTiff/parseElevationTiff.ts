export interface ElevationRaster {
  width: number;
  height: number;
  /** Row by row from the north; meters above the 1737.4 km reference sphere */
  data: Int16Array;
}

const TAG_WIDTH = 256;
const TAG_HEIGHT = 257;
const TAG_BITS = 258;
const TAG_COMPRESSION = 259;
const TAG_STRIP_OFFSETS = 273;
const TAG_ROWS_PER_STRIP = 278;

/** Reads an uncompressed 16-bit signed GeoTIFF as returned by the USGS WMS (image/tiff). */
export function parseElevationTiff(buffer: ArrayBuffer): ElevationRaster {
  const view = new DataView(buffer);
  const byteOrder = view.getUint16(0, false);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) {
    throw new Error('LOLA: the response is not a TIFF image');
  }
  const little = byteOrder === 0x4949;

  const ifd = view.getUint32(4, little);
  const entries = view.getUint16(ifd, little);
  const tags = new Map<number, { type: number; count: number; at: number }>();
  for (let index = 0; index < entries; index++) {
    const at = ifd + 2 + index * 12;
    tags.set(view.getUint16(at, little), {
      type: view.getUint16(at + 2, little),
      count: view.getUint32(at + 4, little),
      at: at + 8,
    });
  }

  const values = (tag: number): number[] => {
    const entry = tags.get(tag);
    if (!entry) throw new Error(`LOLA: TIFF tag ${tag} is missing`);
    const size = entry.type === 3 ? 2 : 4; // SHORT or LONG
    const start =
      size * entry.count <= 4 ? entry.at : view.getUint32(entry.at, little);
    return Array.from({ length: entry.count }, (_, index) =>
      size === 2
        ? view.getUint16(start + index * 2, little)
        : view.getUint32(start + index * 4, little)
    );
  };

  const first = (tag: number) => {
    const value = values(tag)[0];
    if (value === undefined) throw new Error(`LOLA: TIFF tag ${tag} is empty`);
    return value;
  };

  const width = first(TAG_WIDTH);
  const height = first(TAG_HEIGHT);
  if (first(TAG_BITS) !== 16 || first(TAG_COMPRESSION) !== 1) {
    throw new Error('LOLA: expected an uncompressed 16-bit TIFF');
  }
  const rowsPerStrip = first(TAG_ROWS_PER_STRIP);
  const offsets = values(TAG_STRIP_OFFSETS);

  const data = new Int16Array(width * height);
  offsets.forEach((offset, strip) => {
    const firstRow = strip * rowsPerStrip;
    const rows = Math.min(rowsPerStrip, height - firstRow);
    for (let index = 0; index < rows * width; index++) {
      data[firstRow * width + index] = view.getInt16(
        offset + index * 2,
        little
      );
    }
  });
  return { width, height, data };
}
