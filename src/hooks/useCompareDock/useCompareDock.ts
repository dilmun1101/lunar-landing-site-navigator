import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COMPARE_MIN_WIDTH = 320;
export const COMPARE_MAX_WIDTH = 800;
export const COMPARE_DEFAULT_WIDTH = 384;

const clampWidth = (width: number) =>
  Math.round(Math.min(COMPARE_MAX_WIDTH, Math.max(COMPARE_MIN_WIDTH, width)));

interface CompareDockState {
  /** The right panel with the compared scenarios is open */
  open: boolean;
  /** Width of the open panel, px */
  width: number;
  /** The edge is being dragged right now (not saved) */
  resizing: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setWidth: (width: number) => void;
  resetWidth: () => void;
  setResizing: (resizing: boolean) => void;
}

export const useCompareDock = create<CompareDockState>()(
  persist(
    (set) => ({
      // Closed at first: the center stays wide until something is added to compare
      open: false,
      width: COMPARE_DEFAULT_WIDTH,
      resizing: false,
      toggle: () => set((state) => ({ open: !state.open })),
      setOpen: (open) => set({ open }),
      setWidth: (width) => set({ width: clampWidth(width) }),
      resetWidth: () => set({ width: COMPARE_DEFAULT_WIDTH }),
      setResizing: (resizing) => set({ resizing }),
    }),
    {
      name: 'compare-dock:v1',
      // Only the choices are remembered, not the drag in progress
      partialize: (state) => ({ open: state.open, width: state.width }),
    }
  )
);
