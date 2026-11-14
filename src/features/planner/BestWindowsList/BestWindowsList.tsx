import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import { verdictFor } from '@/domain/metrics/verdict/verdict';

interface BestWindowsListProps {
  sites: { id: string; name: string }[];
  dates: Date[];
  /** values[siteIndex][dateIndex], percent; null — the site is not calculated yet */
  values: (number[] | null)[];
  limit?: number;
  className?: string;
}

export default function BestWindowsList({
  sites,
  dates,
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

  // The best start date of every site, then the best sites
  const top = sites
    .flatMap((site, row) => {
      const rowValues = values[row];
      if (!rowValues || rowValues.length === 0) return [];
      let col = 0;
      rowValues.forEach((value, index) => {
        if (value > (rowValues[col] ?? 0)) col = index;
      });
      return [{ site, col, value: rowValues[col] ?? 0 }];
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);

  if (top.length === 0) {
    return (
      <p className={classNames('text-sm text-slate-500', className)}>
        {t('planner.best.empty')}
      </p>
    );
  }

  return (
    <ol className={classNames('flex flex-col gap-2', className)}>
      {top.map((item, index) => (
        <li
          key={item.site.id}
          className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
        >
          <span className="w-5 font-mono text-sm text-slate-500">
            {index + 1}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">
              {item.site.name}
            </p>
            <p className="font-mono text-xs text-slate-500">
              {dates[item.col] ? dateFormat.format(dates[item.col]) : ''}
            </p>
          </div>
          <span className="font-mono text-sm text-slate-100">
            {item.value}%
          </span>
          <Badge verdict={verdictFor(item.value)} />
        </li>
      ))}
    </ol>
  );
}
