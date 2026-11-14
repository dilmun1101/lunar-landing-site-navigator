import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'beginner' | 'expert';

interface ModeState {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      mode: 'expert',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'mode:v1' }
  )
);

/** Current interface mode: beginner sees fewer numbers, expert sees everything */
export function useMode(): Mode {
  return useModeStore((state) => state.mode);
}
