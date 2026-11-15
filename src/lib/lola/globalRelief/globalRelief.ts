import {
  fetchElevationRaster,
  type Bounds,
} from '@/lib/lola/lolaClient/lolaClient';
import type { ElevationRaster } from '@/lib/lola/parseElevationTiff/parseElevationTiff';

/** 0.25 degree per pixel (about 7.5 km at the equator): enough for a globe, about 2 MB. */
const WIDTH = 1440;
const HEIGHT = 720;

const WHOLE_MOON: Bounds = { west: -180, east: 180, south: -90, north: 90 };

/** The whole Moon at low resolution, for the relief of the 3D globe. */
export const fetchGlobalRelief = (): Promise<ElevationRaster> =>
  fetchElevationRaster(WHOLE_MOON, WIDTH, HEIGHT);
