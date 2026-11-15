import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareDockState {
  /** The right panel with the compared scenarios is open */
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useCompareDock = create<CompareDockState>()(
  persist(
    (set) => ({
      // Closed at first: the center stays wide until something is added to compare
      open: false,
      toggle: () => set((state) => ({ open: !state.open })),
      setOpen: (open) => set({ open }),
    }),
    { name: 'compare-dock:v1' }
  )
);
