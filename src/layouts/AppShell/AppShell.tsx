import classNames from 'classnames';
import { useEffect, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import Logo from '@/components/ui/Logo/Logo';
import ModeSwitch from '@/components/ui/ModeSwitch/ModeSwitch';
import CompareDock from '@/features/compare/CompareDock/CompareDock';
import WelcomeCard from '@/features/welcome/WelcomeCard/WelcomeCard';
import { useCompareDock } from '@/hooks/useCompareDock/useCompareDock';
import { useMobileDrawer } from '@/hooks/useMobileDrawer/useMobileDrawer';
import { useSidebarStore } from '@/hooks/useSidebar/useSidebar';
import Sidebar from '@/layouts/Sidebar/Sidebar';
import SiteFooter from '@/layouts/SiteFooter/SiteFooter';
import { useCompareList } from '@/state/useCompareList/useCompareList';

const tabs = [
  { to: '/scenario', labelKey: 'nav.scenario' },
  { to: '/planner', labelKey: 'nav.planner' },
];

const headerButton =
  'relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth lg:hidden';

const MenuIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d="M2.5 4h11M2.5 8h11M2.5 12h11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CompareIcon = () => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d="M2.5 3.5h4v9h-4zM9.5 3.5h4v9h-4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

interface AppShellProps {
  className?: string;
}

export default function AppShell({ className }: AppShellProps) {
  const { t } = useTranslation();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const compareOpen = useCompareDock((state) => state.open);
  const compareWidth = useCompareDock((state) => state.width);
  const comparing = useCompareDock((state) => state.resizing);
  const count = useCompareList((state) => state.items.length);
  const drawer = useMobileDrawer((state) => state.drawer);
  const openDrawer = useMobileDrawer((state) => state.open);
  const closeDrawer = useMobileDrawer((state) => state.close);

  // A pulled-out panel: Esc closes it, the page behind does not scroll
  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawer, closeDrawer]);

  return (
    <div
      className={classNames(
        // Narrow screens: one column, the side panels slide out over the page.
        // The widths are 0 there, so the full-size picture takes the whole width.
        'grid min-h-screen grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr_auto] bg-space-900 text-slate-100 [--compare-width:0px] [--sidebar-width:0px] lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--compare-width)] lg:[--compare-width:var(--compare-open-width)]',
        collapsed ? 'lg:[--sidebar-width:3rem]' : 'lg:[--sidebar-width:20rem]',
        // No smoothing while the edge is dragged: the panel must follow the mouse
        { 'transition-[grid-template-columns] duration-200': !comparing },
        className
      )}
      // Other parts (the full-size picture) read the widths of the side panels from here
      style={
        {
          // Never wider than 60% of the window, so the center cannot be squeezed out
          '--compare-open-width': compareOpen
            ? `min(${compareWidth}px, 60vw)`
            : '3rem',
        } as CSSProperties
      }
    >
      <header className="sticky top-0 z-40 col-span-full flex h-14 items-center gap-3 border-b border-white/10 bg-space-900/90 px-3 backdrop-blur sm:gap-6 lg:gap-8 lg:px-4">
        <button
          type="button"
          aria-label={t('sidebar.open')}
          title={t('sidebar.open')}
          aria-expanded={drawer === 'sidebar'}
          onClick={() =>
            drawer === 'sidebar' ? closeDrawer() : openDrawer('sidebar')
          }
          className={headerButton}
        >
          <MenuIcon />
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <Logo />
          <span className="hidden text-sm font-semibold tracking-[0.18em] uppercase xl:inline">
            Lunar <span className="text-accent">Landing Navigator</span>
          </span>
        </div>

        <nav className="flex h-full min-w-0 gap-4 sm:gap-6">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              onClick={closeDrawer}
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
          {/* On a phone they move into the pulled-out parameters panel */}
          <ModeSwitch className="hidden md:flex" />
          <LanguageSwitch className="hidden md:flex" />
          <button
            type="button"
            aria-label={t('compare.dock.expand')}
            title={t('compare.dock.expand')}
            aria-expanded={drawer === 'compare'}
            onClick={() =>
              drawer === 'compare' ? closeDrawer() : openDrawer('compare')
            }
            className={headerButton}
          >
            <CompareIcon />
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-accent font-mono text-[10px] text-space-900"
                aria-label={t('compare.dock.count', { count })}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {drawer && (
        <div
          aria-hidden="true"
          onClick={closeDrawer}
          className="fixed inset-x-0 top-14 bottom-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <Sidebar />

      <main className="flex min-w-0 flex-col gap-4 p-3 sm:p-4 lg:col-start-2">
        <WelcomeCard />
        <Outlet />
      </main>

      <CompareDock />

      <SiteFooter />
    </div>
  );
}
