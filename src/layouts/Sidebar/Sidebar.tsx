import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import AddToComparisonButton from '@/features/compare/AddToComparisonButton/AddToComparisonButton';
import CriteriaPanel from '@/features/setup/CriteriaPanel/CriteriaPanel';
import MissionDuration from '@/features/setup/MissionDuration/MissionDuration';
import TemporalSetup from '@/features/setup/TemporalSetup/TemporalSetup';
import LandingDate from '@/features/sites/LandingDate/LandingDate';
import SitePicker from '@/features/sites/SitePicker/SitePicker';
import CloseIcon from '@/components/ui/CloseIcon/CloseIcon';
import LanguageSwitch from '@/components/ui/LanguageSwitch/LanguageSwitch';
import ModeSwitch from '@/components/ui/ModeSwitch/ModeSwitch';
import { useMobileDrawer } from '@/hooks/useMobileDrawer/useMobileDrawer';
import { useMode } from '@/hooks/useMode/useMode';
import { useSidebarStore } from '@/hooks/useSidebar/useSidebar';

interface SidebarProps {
  className?: string;
}

const panelButton =
  'flex size-8 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth';

const ChevronIcon = ({ pointsLeft }: { pointsLeft: boolean }) => (
  <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
    <path
      d={pointsLeft ? 'm10 3-5 5 5 5' : 'm6 3 5 5-5 5'}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Sidebar({ className }: SidebarProps) {
  const { t } = useTranslation();
  const beginner = useMode() === 'beginner';
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  const label = t(collapsed ? 'sidebar.expand' : 'sidebar.collapse');
  const mobileOpen = useMobileDrawer((state) => state.drawer === 'sidebar');
  const closeDrawer = useMobileDrawer((state) => state.close);

  return (
    <aside
      className={classNames(
        // Narrow screens: a panel that slides out from the left over the page
        'fixed top-14 bottom-0 left-0 z-30 flex w-[min(20rem,88vw)] flex-col border-r border-white/10 bg-space-900 transition-[transform,visibility] duration-200',
        mobileOpen ? 'translate-x-0' : 'invisible -translate-x-full',
        'lg:visible lg:sticky lg:bottom-auto lg:left-auto lg:z-auto lg:row-span-2 lg:h-[calc(100vh-3.5rem)] lg:w-auto lg:translate-x-0 lg:transition-none',
        className
      )}
    >
      {/* The button stays in the corner while the content below scrolls */}
      <div
        className={classNames(
          'flex shrink-0 items-center justify-between gap-2 p-2 pl-4',
          { 'lg:justify-center lg:pl-2': collapsed }
        )}
      >
        <span
          className={classNames(
            'text-[11px] font-semibold tracking-wider text-slate-500 uppercase',
            { 'lg:hidden': collapsed }
          )}
        >
          {t('sidebar.title')}
        </span>
        <button
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={!collapsed}
          onClick={toggle}
          className={classNames(panelButton, 'hidden lg:flex')}
        >
          <ChevronIcon pointsLeft={!collapsed} />
        </button>
        <button
          type="button"
          aria-label={t('sidebar.close')}
          title={t('sidebar.close')}
          onClick={closeDrawer}
          className={classNames(panelButton, 'lg:hidden')}
        >
          <CloseIcon />
        </button>
      </div>

      {/* Hidden, not removed: what the person typed in the fields is kept */}
      <div
        className={classNames(
          'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 pt-2',
          // Folding is a wide-screen thing: on a phone the pulled-out panel shows everything
          { 'lg:hidden': collapsed }
        )}
      >
        {/* On a phone the header has no room for these */}
        <div className="flex flex-wrap gap-3 md:hidden">
          <ModeSwitch />
          <LanguageSwitch />
        </div>
        <SitePicker />
        <LandingDate />
        <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
          <TemporalSetup />
          <MissionDuration />
          {/* Thresholds are for experts; a beginner keeps the defaults */}
          {!beginner && <CriteriaPanel />}
        </div>
        <AddToComparisonButton className="mt-auto" />
      </div>
    </aside>
  );
}
