import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  demoPlannerDates,
  demoPlannerSites,
} from '@/features/planner/demoPlanner';

export interface HoveredCell {
  row: number;
  col: number;
}

interface ViabilityHeatmapProps {
  /** values[siteIndex][dateIndex], проценты */
  values: number[][];
  hovered: HoveredCell | null;
  onHover: (cell: HoveredCell | null) => void;
  className?: string;
}

export default function ViabilityHeatmap({
  values,
  hovered,
  onHover,
  className,
}: ViabilityHeatmapProps) {
  const { t, i18n } = useTranslation();
  const monthFormat = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
  });
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={classNames('overflow-x-auto', className)}>
      <div
        className="grid min-w-[44rem] items-center gap-1"
        style={{
          gridTemplateColumns: `9.5rem repeat(${demoPlannerDates.length}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => onHover(null)}
      >
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {t('planner.heatmap.rows')} / {t('planner.heatmap.columns')}
        </span>
        {demoPlannerDates.map((date, col) => (
          <span
            key={date.toISOString()}
            className="h-4 text-center font-mono text-[10px] whitespace-nowrap text-slate-500"
          >
            {col % 3 === 0 ? monthFormat.format(date) : ''}
          </span>
        ))}

        {demoPlannerSites.map((site, row) => (
          <div key={site.id} className="contents">
            <span className="truncate pr-2 text-sm text-slate-300">
              {site.name}
            </span>
            {demoPlannerDates.map((date, col) => {
              const value = values[row]?.[col] ?? 0;
              const isHovered = hovered?.row === row && hovered.col === col;
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  aria-label={`${site.name}, ${dateFormat.format(date)}: ${value}%`}
                  onMouseEnter={() => onHover({ row, col })}
                  onFocus={() => onHover({ row, col })}
                  onBlur={() => onHover(null)}
                  className={classNames(
                    'h-7 cursor-pointer rounded-sm border border-white/5 transition-shadow hover:ring-2 hover:ring-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                    { 'ring-2 ring-accent': isHovered }
                  )}
                  style={{
                    backgroundColor: `rgb(52 211 153 / ${value / 100})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
