export type SiteGroup = 'clps' | 'apollo';

export interface SiteCoordinates {
  /** Latitude, degrees (south is negative) */
  lat: number;
  /** East longitude, degrees (west is negative) */
  lon: number;
  /** true — center of a region/crater, not an exact landing point */
  approximate?: boolean;
}

export interface CatalogSite {
  id: string;
  /** Display name. Not translated (established English names). */
  name: string;
  group: SiteGroup;
  /** No coordinates — Horizons data cannot be requested for the site */
  coordinates?: SiteCoordinates;
}
