import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DurationKey } from '@/state/useScenarioStore/useScenarioStore';

export const MAX_COMPARE_ITEMS = 4;

export interface CompareItem {
  id: string;
  siteName: string;
  /** ISO 8601, UTC */
  epoch: string;
  duration: DurationKey;
  /** null — the site has no coordinates, so data cannot be requested */
  coordinates: { lat: number; lon: number; approximate?: boolean } | null;
}

interface CompareState {
  items: CompareItem[];
  add: (item: Omit<CompareItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useCompareList = create<CompareState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => {
          const duplicate = state.items.some(
            (existing) =>
              existing.siteName === item.siteName &&
              existing.epoch === item.epoch &&
              existing.duration === item.duration
          );
          if (duplicate || state.items.length >= MAX_COMPARE_ITEMS)
            return state;
          return {
            items: [...state.items, { ...item, id: crypto.randomUUID() }],
          };
        }),
      remove: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    { name: 'compare-list' }
  )
);
