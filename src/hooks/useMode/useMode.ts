import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Mode = 'beginner' | 'expert';

interface ModeState {
  mode: Mode;
  /** The welcome card was closed */
  welcomed: boolean;
  setMode: (mode: Mode) => void;
  dismissWelcome: () => void;
}

export const useModeStore = create<ModeState>()(
  persist(
    (set) => ({
      // First-time visitors start in the simple mode
      mode: 'beginner',
      welcomed: false,
      setMode: (mode) => set({ mode }),
      dismissWelcome: () => set({ welcomed: true }),
    }),
    { name: 'mode:v1' }
  )
);

/** Current interface mode: beginner sees fewer numbers, expert sees everything */
export function useMode(): Mode {
  return useModeStore((state) => state.mode);
}
