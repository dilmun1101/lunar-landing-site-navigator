import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import AddToComparisonButton from '@/features/compare/AddToComparisonButton/AddToComparisonButton';
import CriteriaPanel from '@/features/setup/CriteriaPanel/CriteriaPanel';
import MissionDuration from '@/features/setup/MissionDuration/MissionDuration';
import TemporalSetup from '@/features/setup/TemporalSetup/TemporalSetup';
import LandingDate from '@/features/sites/LandingDate/LandingDate';
import SitePicker from '@/features/sites/SitePicker/SitePicker';
import { useMode } from '@/hooks/useMode/useMode';
import { useSidebarStore } from '@/hooks/useSidebar/useSidebar';

interface SidebarProps {
  className?: string;
}

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

  return (
    <aside
      className={classNames(
        'sticky top-14 row-span-2 flex h-[calc(100vh-3.5rem)] flex-col border-r border-white/10 bg-space-900',
        className
      )}
    >
      {/* The button stays in the corner while the content below scrolls */}
      <div
        className={classNames(
          'flex shrink-0 items-center gap-2 p-2',
          collapsed ? 'justify-center' : 'justify-between pl-4'
        )}
      >
        {!collapsed && (
          <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {t('sidebar.title')}
          </span>
        )}
        <button
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={!collapsed}
          onClick={toggle}
          className="flex size-8 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth"
        >
          <ChevronIcon pointsLeft={!collapsed} />
        </button>
      </div>

      {/* Hidden, not removed: what the person typed in the fields is kept */}
      <div
        className={classNames(
          'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 pt-2',
          { hidden: collapsed }
        )}
      >
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
