import { create } from 'zustand';

/** Which side panel is pulled out over the page on a narrow screen; not saved. */
export type MobileDrawer = 'sidebar' | 'compare' | null;

interface MobileDrawerState {
  drawer: MobileDrawer;
  open: (drawer: Exclude<MobileDrawer, null>) => void;
  close: () => void;
}

export const useMobileDrawer = create<MobileDrawerState>()((set) => ({
  drawer: null,
  open: (drawer) => set({ drawer }),
  close: () => set({ drawer: null }),
}));
