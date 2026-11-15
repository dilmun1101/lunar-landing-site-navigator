/** clps — Artemis candidate regions; commercial — landings of NASA CLPS companies */
export type SiteGroup = 'clps' | 'commercial' | 'international' | 'apollo';

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
  /** Historical landing time, ISO 8601 UTC (missions that have landed) */
  landing?: string;
}
