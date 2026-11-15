import { siteCatalog } from '@/features/sites/siteCatalog';
import type { SiteCoordinates } from '@/features/sites/types';

export interface PlannerSite {
  id: string;
  name: string;
  coordinates: SiteCoordinates;
}

/** Catalog sites that have coordinates — only for them Horizons data can be requested. */
export const plannerSites: PlannerSite[] = siteCatalog.flatMap((site) =>
  site.coordinates
    ? [{ id: site.id, name: site.name, coordinates: site.coordinates }]
    : []
);
