/** Public NASA/LROC tools. They forbid embedding in other pages, so they open in a new tab. */
export const externalLinks = {
  quickmap: 'https://quickmap.lroc.asu.edu/',
  moonTrek: 'https://trek.nasa.gov/moon/',
  horizons: 'https://ssd.jpl.nasa.gov/horizons/',
  csaMoonExploration:
    'https://www.asc-csa.gc.ca/eng/astronomy/moon-exploration/',
} as const;

export interface LatLon {
  /** Latitude, degrees (south is negative) */
  lat: number;
  /** East longitude, degrees (west is negative) */
  lon: number;
}

const hemispheres = {
  ru: { north: 'с. ш.', south: 'ю. ш.', east: 'в. д.', west: 'з. д.' },
  en: { north: 'N', south: 'S', east: 'E', west: 'W' },
} as const;

/** Human-readable coordinates: `89.90° S, 0.00° E` (ru: `89.90° ю. ш., 0.00° в. д.`). */
export function formatCoordinates(
  { lat, lon }: LatLon,
  language: string
): string {
  const names = language.startsWith('ru') ? hemispheres.ru : hemispheres.en;
  const latName = lat < 0 ? names.south : names.north;
  const lonName = lon < 0 ? names.west : names.east;
  return `${Math.abs(lat).toFixed(2)}° ${latName}, ${Math.abs(lon).toFixed(2)}° ${lonName}`;
}

/** Plain decimals for pasting into a search box: `-89.90, 0.00` */
export function coordinatesForSearch({ lat, lon }: LatLon): string {
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}
