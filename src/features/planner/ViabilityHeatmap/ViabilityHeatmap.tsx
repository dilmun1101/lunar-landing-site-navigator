import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

export interface HoveredCell {
  row: number;
  col: number;
}

interface ViabilityHeatmapProps {
  sites: { id: string; name: string }[];
  dates: Date[];
  /** values[siteIndex][dateIndex], percent; null — the site is not calculated yet */
  values: (number[] | null)[];
  hovered: HoveredCell | null;
  onHover: (cell: HoveredCell | null) => void;
  /** The cell pinned by a click: its details stay open when the pointer leaves */
  selected: HoveredCell | null;
  onSelect: (cell: HoveredCell | null) => void;
  className?: string;
}

export default function ViabilityHeatmap({
  sites,
  dates,
  values,
  hovered,
  onHover,
  selected,
  onSelect,
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
          gridTemplateColumns: `9.5rem repeat(${dates.length}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => onHover(null)}
      >
        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {t('planner.heatmap.rows')} / {t('planner.heatmap.columns')}
        </span>
        {dates.map((date, col) => (
          <span
            key={date.toISOString()}
            className="h-4 text-center font-mono text-[10px] whitespace-nowrap text-slate-500"
          >
            {col % 3 === 0 ? monthFormat.format(date) : ''}
          </span>
        ))}

        {sites.map((site, row) => {
          const rowValues = values[row];
          return (
            <div key={site.id} className="contents">
              <span
                className={classNames('truncate pr-2 text-sm text-slate-300', {
                  'text-slate-500': !rowValues,
                })}
              >
                {site.name}
              </span>
              {dates.map((date, col) => {
                const value = rowValues?.[col];
                if (value === undefined) {
                  return (
                    <span
                      key={date.toISOString()}
                      aria-label={`${site.name}, ${dateFormat.format(date)}: ${t('planner.cellPending')}`}
                      className="h-7 animate-pulse rounded-sm border border-white/5 bg-white/10"
                    />
                  );
                }
                const isHovered = hovered?.row === row && hovered.col === col;
                const isSelected =
                  selected?.row === row && selected.col === col;
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    aria-label={`${site.name}, ${dateFormat.format(date)}: ${value}%`}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(isSelected ? null : { row, col })}
                    onMouseEnter={() => onHover({ row, col })}
                    onFocus={() => onHover({ row, col })}
                    onBlur={() => onHover(null)}
                    className={classNames(
                      'h-7 cursor-pointer rounded-sm border border-white/5 transition-shadow hover:ring-2 hover:ring-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none',
                      {
                        'ring-2 ring-accent': isHovered,
                        'ring-2 ring-white': isSelected && !isHovered,
                      }
                    )}
                    style={{
                      backgroundColor: `rgb(52 211 153 / ${value / 100})`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
