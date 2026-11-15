import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  clampCriterion,
  type Criteria,
  defaultCriteria,
} from '@/domain/criteria/criteria';

interface CriteriaState {
  criteria: Criteria;
  setCriterion: (key: keyof Criteria, value: number) => void;
  reset: () => void;
}

export const useCriteriaStore = create<CriteriaState>()(
  persist(
    (set) => ({
      criteria: defaultCriteria,
      setCriterion: (key, value) =>
        set((state) => ({
          criteria: { ...state.criteria, [key]: clampCriterion(key, value) },
        })),
      reset: () => set({ criteria: defaultCriteria }),
    }),
    {
      name: 'criteria:v1',
      partialize: (state) => ({ criteria: state.criteria }),
      // Criteria added later get their default values
      merge: (persisted, current) => ({
        ...current,
        criteria: {
          ...current.criteria,
          ...(persisted as Partial<CriteriaState> | undefined)?.criteria,
        },
      }),
    }
  )
);
