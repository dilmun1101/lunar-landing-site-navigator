import type { ElevationTile } from '@/lib/lola/elevationWindow/elevationWindow';
import { parseElevationTiff } from '@/lib/lola/parseElevationTiff/parseElevationTiff';

// The USGS WMS does not send CORS headers either, so the browser calls its own origin and
// Vite forwards the request: see server.proxy / preview.proxy in vite.config.ts.
// The proxy rewrites /usgs-wms → https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=…moon_simp_cyl_elev.map
const WMS_URL = '/usgs-wms';

const KM_PER_DEGREE = (2 * Math.PI * 1737.4) / 360;
const MAX_PIXELS = 2048;
/** LOLA global DEM: 256 pixels per degree ≈ 118 m */
const NATIVE_CELL_KM = 0.12;

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const deg = (radians: number) => (radians * 180) / Math.PI;

interface Bounds {
  west: number;
  east: number;
  south: number;
  north: number;
}

/** Geographic windows (within ±180°) that cover the circle of the given radius around the point. */
export function planWindows(
  lat: number,
  lon: number,
  radiusKm: number
): Bounds[] {
  const angle = radiusKm / KM_PER_DEGREE; // degrees
  const south = Math.max(-90, lat - angle);
  const north = Math.min(90, lat + angle);

  // Half-width in longitude; the whole circle of longitudes if the window contains a pole
  const ratio = Math.sin(rad(angle)) / Math.cos(rad(lat));
  const halfLon =
    south === -90 || north === 90 || ratio >= 1
      ? 180
      : Math.min(180, deg(Math.asin(ratio)) * 1.05);

  const bounds = (west: number, east: number): Bounds => ({
    west,
    east,
    south,
    north,
  });
  if (halfLon >= 180) return [bounds(-180, 180)];
  const west = lon - halfLon;
  const east = lon + halfLon;
  if (west < -180) return [bounds(west + 360, 180), bounds(-180, east)];
  if (east > 180) return [bounds(west, 180), bounds(-180, east - 360)];
  return [bounds(west, east)];
}

/** Image size that gives roughly the native resolution of the DEM. */
function imageSize(bounds: Bounds, radiusKm: number) {
  const cell = Math.max(NATIVE_CELL_KM, (2 * radiusKm) / MAX_PIXELS);
  // Longitude is stretched toward the pole: take the latitude farthest from it
  const widest = Math.cos(
    rad(Math.min(Math.abs(bounds.south), Math.abs(bounds.north)))
  );
  const clamp = (value: number) =>
    Math.min(MAX_PIXELS, Math.max(16, Math.ceil(value)));
  return {
    width: clamp(((bounds.east - bounds.west) * KM_PER_DEGREE * widest) / cell),
    height: clamp(((bounds.north - bounds.south) * KM_PER_DEGREE) / cell),
  };
}

/** Requests LOLA elevations (meters) around the point from the USGS Web Map Service. */
export async function fetchElevationTiles(
  lat: number,
  lon: number,
  radiusKm: number
): Promise<ElevationTile[]> {
  return Promise.all(
    planWindows(lat, lon, radiusKm).map(async (bounds) => {
      const { width, height } = imageSize(bounds, radiusKm);
      const params = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetMap',
        LAYERS: 'LOLA_elev',
        STYLES: '',
        SRS: 'EPSG:4326',
        BBOX: [bounds.west, bounds.south, bounds.east, bounds.north].join(','),
        WIDTH: String(width),
        HEIGHT: String(height),
        FORMAT: 'image/tiff',
      });
      const response = await fetch(`${WMS_URL}?${params}`);
      if (!response.ok) throw new Error(`LOLA: HTTP ${response.status}`);
      const raster = parseElevationTiff(await response.arrayBuffer());
      return { ...bounds, ...raster };
    })
  );
}
