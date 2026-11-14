import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

interface HeatmapTooltipProps {
  site?: string;
  date?: Date;
  /** Процент 0–100 */
  value?: number;
  className?: string;
}

export default function HeatmapTooltip({
  site,
  date,
  value,
  className,
}: HeatmapTooltipProps) {
  const { t, i18n } = useTranslation();
  const hasCell =
    site !== undefined && date !== undefined && value !== undefined;

  const items = hasCell
    ? [
        { key: 'site', text: site },
        {
          key: 'date',
          text: new Intl.DateTimeFormat(i18n.language, {
            timeZone: 'UTC',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(date),
        },
        { key: 'value', text: `${value}%` },
      ]
    : [];

  return (
    <div
      className={classNames(
        'flex min-h-10 flex-wrap items-center gap-x-6 gap-y-1 text-sm',
        className
      )}
      aria-live="polite"
    >
      {hasCell ? (
        items.map((item) => (
          <span key={item.key} className="flex gap-2">
            <span className="text-slate-500">
              {t(`planner.tooltip.${item.key}`)}
            </span>
            <span className="font-mono text-slate-100">{item.text}</span>
          </span>
        ))
      ) : (
        <span className="text-slate-500">{t('planner.hint')}</span>
      )}
    </div>
  );
}
