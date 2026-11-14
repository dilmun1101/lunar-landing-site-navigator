import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import {
  demoPlannerDates,
  demoPlannerSites,
} from '@/features/planner/demoPlanner';
import type { Verdict } from '@/types';

interface BestWindowsListProps {
  values: number[][];
  limit?: number;
  className?: string;
}

const verdictOf = (value: number): Verdict =>
  value >= 70 ? 'viable' : value >= 40 ? 'marginal' : 'not-viable';

export default function BestWindowsList({
  values,
  limit = 5,
  className,
}: BestWindowsListProps) {
  const { t, i18n } = useTranslation();
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const top = values
    .flatMap((rowValues, row) =>
      rowValues.map((value, col) => ({ row, col, value }))
    )
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  return (
    <ol className={classNames('flex flex-col gap-2', className)}>
      {top.map((item, index) => (
        <li
          key={`${item.row}-${item.col}`}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
        >
          <span className="w-5 font-mono text-sm text-slate-500">
            {index + 1}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">
              {demoPlannerSites[item.row]?.name}
            </p>
            <p className="font-mono text-xs text-slate-500">
              {dateFormat.format(demoPlannerDates[item.col])}
            </p>
          </div>
          <span className="font-mono text-sm text-slate-100">
            {item.value}%
          </span>
          <Badge verdict={verdictOf(item.value)} />
          <button
            type="button"
            className="text-xs text-slate-400 transition-colors hover:text-accent"
          >
            {t('common.addToComparison')}
          </button>
        </li>
      ))}
    </ol>
  );
}
