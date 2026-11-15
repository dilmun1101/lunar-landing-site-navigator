import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  /** The left panel is folded to a narrow strip */
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: 'sidebar:v1' }
  )
);
