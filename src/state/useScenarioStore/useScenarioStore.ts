import { create } from 'zustand';
import { siteCatalog } from '@/features/sites/siteCatalog';

export type DurationKey = '7' | '14' | 'cycle';

/** Длительность миссии в сутках; «cycle» — полный лунный цикл. */
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
  /** Выбранная площадка из каталога; null, если заданы свои координаты */
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

/** Читаемое имя текущей площадки (для заголовков и списка сравнения). */
export function getSiteName(
  state: Pick<ScenarioState, 'siteId' | 'customSite'>
): string {
  if (state.customSite) {
    const { lat, lon } = state.customSite;
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
  return siteCatalog.find((site) => site.id === state.siteId)?.name ?? '';
}
