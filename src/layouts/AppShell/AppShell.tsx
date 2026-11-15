import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import Logo from '@/components/ui/Logo/Logo';
import ModeSwitch from '@/components/ui/ModeSwitch/ModeSwitch';
import CompareDock from '@/features/compare/CompareDock/CompareDock';
import WelcomeCard from '@/features/welcome/WelcomeCard/WelcomeCard';
import { useCompareDock } from '@/hooks/useCompareDock/useCompareDock';
import { useSidebarStore } from '@/hooks/useSidebar/useSidebar';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import SiteFooter from '@/layouts/SiteFooter/SiteFooter';

const tabs = [
  { to: '/scenario', labelKey: 'nav.scenario' },
  { to: '/planner', labelKey: 'nav.planner' },
];

interface AppShellProps {
  className?: string;
}

export default function AppShell({ className }: AppShellProps) {
  const { t } = useTranslation();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const compareOpen = useCompareDock((state) => state.open);
  const compareWidth = useCompareDock((state) => state.width);
  const comparing = useCompareDock((state) => state.resizing);

  return (
    <div
      className={classNames(
        'grid min-h-screen grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--compare-width)] grid-rows-[auto_1fr_auto] bg-space-900 text-slate-100',
        // No smoothing while the edge is dragged: the panel must follow the mouse
        { 'transition-[grid-template-columns] duration-200': !comparing },
        className
      )}
      // Other parts (the full-size picture) read the widths of the side panels from here
      style={
        {
          '--sidebar-width': collapsed ? '3rem' : '20rem',
          // Never wider than 60% of the window, so the center cannot be squeezed out
          '--compare-width': compareOpen
            ? `min(${compareWidth}px, 60vw)`
            : '3rem',
        } as CSSProperties
      }
    >
      <header className="sticky top-0 z-10 col-span-3 flex h-14 items-center gap-8 border-b border-white/10 bg-space-900/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-sm font-semibold tracking-[0.18em] uppercase">
            Lunar <span className="text-accent">Landing Navigator</span>
          </span>
        </div>

        <nav className="flex h-full gap-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                classNames(
                  'flex h-full items-center border-b-2 text-sm font-medium transition-colors',
                  {
                    'border-accent text-accent': isActive,
                    'border-transparent text-slate-400 hover:text-accent':
                      !isActive,
                  }
                )
              }
            >
              {t(tab.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <ModeSwitch />
          <LanguageSwitch />
        </div>
      </header>

      <Sidebar />

      <main className="col-start-2 flex min-w-0 flex-col gap-4 p-4">
        <WelcomeCard />
        <Outlet />
      </main>

      <CompareDock />

      <SiteFooter />
    </div>
  );
}
