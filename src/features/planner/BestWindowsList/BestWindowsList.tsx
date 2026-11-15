import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import type { Criteria } from '@/domain/criteria/criteria';
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import type { PlannerSite } from '@/features/planner/plannerSites';
import { useMode } from '@/hooks/useMode/useMode';

export interface BestWindow {
  site: PlannerSite;
  startMs: number;
  /** Share of the mission by the chosen metric, percent */
  percent: number;
}

/** Whether the window can be added to the comparison */
export type CompareState = 'add' | 'added' | 'full';

interface BestWindowsListProps {
  windows: BestWindow[];
  criteria: Criteria;
  /** Open the window in the scenario */
  onOpen: (window: BestWindow) => void;
  /** Add the window to the comparison */
  onAdd: (window: BestWindow) => void;
  /** State of the comparison list for the window: tells why the button may be disabled */
  compareState: (window: BestWindow) => CompareState;
  limit?: number;
  className?: string;
}

export default function BestWindowsList({
  windows,
  criteria,
  onOpen,
  onAdd,
  compareState,
  limit = 5,
  className,
}: BestWindowsListProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';
  const dateFormat = new Intl.DateTimeFormat(
    i18n.language,
    beginner
      ? { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }
      : {
          timeZone: 'UTC',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZoneName: 'short',
        }
  );

  // The best start of every site, then the best sites
  const top = [...windows]
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);

  if (top.length === 0) {
    return (
      <p className={classNames('text-sm text-slate-500', className)}>
        {t('planner.best.empty')}
      </p>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <p className="text-xs text-slate-500">
        {t(beginner ? 'planner.best.hintBeginner' : 'planner.best.hint')}
      </p>
      <ol className="flex flex-col gap-2">
        {top.map((item, index) => (
          <li
            key={item.site.id}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="flex flex-1 cursor-pointer items-center gap-3 text-left transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-earth"
            >
              <span className="w-5 font-mono text-sm text-slate-500">
                {index + 1}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-slate-100">
                  {item.site.name}
                </span>
                <span className="block font-mono text-xs text-slate-500">
                  {dateFormat.format(item.startMs)}
                </span>
              </span>
              {!beginner && (
                <span className="font-mono text-sm text-slate-100">
                  {item.percent}%
                </span>
              )}
              <Badge verdict={verdictFor(item.percent, criteria)} />
            </button>
            <button
              type="button"
              onClick={() => onAdd(item)}
              disabled={compareState(item) !== 'add'}
              title={
                compareState(item) === 'full'
                  ? t('planner.best.compareFullHint')
                  : undefined
              }
              className="text-xs text-slate-400 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:text-slate-600"
            >
              {compareState(item) === 'added'
                ? t('planner.best.added')
                : compareState(item) === 'full'
                  ? t('planner.best.compareFull')
                  : t('common.addToComparison')}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
