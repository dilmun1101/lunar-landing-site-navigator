import { create } from 'zustand';
import { siteCatalog } from '@/features/sites/siteCatalog';

export type DurationKey = '7' | '14' | 'cycle';

/** Mission duration in days; "cycle" is a full lunar cycle. */
export const durationDays: Record<DurationKey, number> = {
  '7': 7,
  '14': 14,
  cycle: 29.53,
};

export interface CustomSite {
  lat: number;
  lon: number;
}

interface ScenarioState {
  /** Selected catalog site; null if custom coordinates are set */
  siteId: string | null;
  customSite: CustomSite | null;
  epoch: Date;
  duration: DurationKey;
  selectSite: (siteId: string) => void;
  setCustomSite: (site: CustomSite) => void;
  setEpoch: (epoch: Date) => void;
  setDuration: (duration: DurationKey) => void;
}

export const useScenarioStore = create<ScenarioState>()((set) => ({
  siteId: 'malapert-massif',
  customSite: null,
  epoch: new Date(),
  duration: 'cycle',
  selectSite: (siteId) => set({ siteId, customSite: null }),
  setCustomSite: (customSite) => set({ customSite, siteId: null }),
  setEpoch: (epoch) => set({ epoch }),
  setDuration: (duration) => set({ duration }),
}));

/** Readable name of the current site (for headings and the compare list). */
export function getSiteName(
  state: Pick<ScenarioState, 'siteId' | 'customSite'>
): string {
  if (state.customSite) {
    const { lat, lon } = state.customSite;
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
  return siteCatalog.find((site) => site.id === state.siteId)?.name ?? '';
}

/**
 * Coordinates of the selected site: custom or from the catalog.
 * null — the site has no coordinates (e.g. Leibnitz Beta Plateau).
 * Returns the same object for the same arguments (safe for hook dependencies).
 */
export function resolveCoordinates(
  siteId: string | null,
  customSite: CustomSite | null
): { lat: number; lon: number; approximate?: boolean } | null {
  if (customSite) return customSite;
  return siteCatalog.find((site) => site.id === siteId)?.coordinates ?? null;
}
