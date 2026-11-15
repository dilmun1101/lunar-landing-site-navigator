import { siteCatalog } from '@/features/sites/siteCatalog';
import type { SiteCoordinates } from '@/features/sites/types';

export interface PlannerSite {
  id: string;
  name: string;
  coordinates: SiteCoordinates;
}

/**
 * Catalog sites that have coordinates — only for them Horizons data can be requested.
 * Only the Artemis candidates and Apollo: every row costs Horizons and LOLA requests,
 * so the other landings are not added to the planner.
 */
export const plannerSites: PlannerSite[] = siteCatalog.flatMap((site) =>
  site.coordinates && (site.group === 'clps' || site.group === 'apollo')
    ? [{ id: site.id, name: site.name, coordinates: site.coordinates }]
    : []
);
