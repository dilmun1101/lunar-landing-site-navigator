import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ComparePanel from '@/features/compare/ComparePanel/ComparePanel';
import { useCompareDock } from '@/hooks/useCompareDock/useCompareDock';
import { useCompareList } from '@/state/useCompareList/useCompareList';

interface CompareDockProps {
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

/** The right panel with the compared scenarios; folds into a narrow strip with a counter. */
export default function CompareDock({ className }: CompareDockProps) {
  const { t } = useTranslation();
  const open = useCompareDock((state) => state.open);
  const toggle = useCompareDock((state) => state.toggle);
  const count = useCompareList((state) => state.items.length);
  const label = t(open ? 'compare.dock.collapse' : 'compare.dock.expand');

  return (
    <aside
      className={classNames(
        'sticky top-14 col-start-3 row-span-2 row-start-2 flex h-[calc(100vh-3.5rem)] flex-col border-l border-white/10 bg-space-900',
        className
      )}
    >
      <div
        className={classNames('flex shrink-0 flex-col gap-2 p-2', {
          'items-center': !open,
        })}
      >
        <button
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={open}
          onClick={toggle}
          className="flex size-8 items-center justify-center rounded-lg border border-white/15 text-slate-300 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth"
        >
          {/* Open: the arrow sends the panel to the right; closed: it pulls it out to the left */}
          <ChevronIcon pointsLeft={!open} />
        </button>
        {!open && count > 0 && (
          <span
            className="flex size-6 items-center justify-center rounded-full bg-accent/20 font-mono text-xs text-accent"
            aria-label={t('compare.dock.count', { count })}
          >
            {count}
          </span>
        )}
      </div>

      {/* Hidden, not removed: the cards keep their data */}
      <div
        className={classNames('min-h-0 flex-1 overflow-y-auto p-4 pt-2', {
          hidden: !open,
        })}
      >
        <ComparePanel />
      </div>
    </aside>
  );
}
