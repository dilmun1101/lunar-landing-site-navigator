import classNames from 'classnames';
import AddToComparisonButton from '@/features/compare/AddToComparisonButton/AddToComparisonButton';
import MissionDuration from '@/features/setup/MissionDuration/MissionDuration';
import TemporalSetup from '@/features/setup/TemporalSetup/TemporalSetup';
import SitePicker from '@/features/sites/SitePicker/SitePicker';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={classNames(
        'sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col gap-5 overflow-y-auto border-r border-white/10 p-4',
        className
      )}
    >
      <SitePicker />
      <div className="flex flex-col gap-5 border-t border-white/10 pt-5">
        <TemporalSetup />
        <MissionDuration />
      </div>
      <AddToComparisonButton className="mt-auto" />
    </aside>
  );
}
