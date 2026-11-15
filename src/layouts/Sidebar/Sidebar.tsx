import classNames from 'classnames';
import AddToComparisonButton from '@/features/compare/AddToComparisonButton/AddToComparisonButton';
import CriteriaPanel from '@/features/setup/CriteriaPanel/CriteriaPanel';
import MissionDuration from '@/features/setup/MissionDuration/MissionDuration';
import TemporalSetup from '@/features/setup/TemporalSetup/TemporalSetup';
import LandingDate from '@/features/sites/LandingDate/LandingDate';
import SitePicker from '@/features/sites/SitePicker/SitePicker';
import { useMode } from '@/hooks/useMode/useMode';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const beginner = useMode() === 'beginner';

  return (
    <aside
      className={classNames(
        'sticky top-14 row-span-2 flex h-[calc(100vh-3.5rem)] flex-col gap-5 overflow-y-auto border-r border-white/10 bg-space-900 p-4',
        className
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
    </aside>
  );
}
