import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import { useMode } from '@/hooks/useMode/useMode';

interface HeatmapTooltipProps {
  site?: string;
  date?: Date;
  /** Percent, 0–100 */
  value?: number;
  criteria?: Criteria;
  className?: string;
}

export default function HeatmapTooltip({
  site,
  date,
  value,
  criteria = defaultCriteria,
  className,
}: HeatmapTooltipProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';
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
        {
          key: 'value',
          // A beginner gets a word, an expert gets the number
          text: beginner
            ? t(
                `verdict.${
                  verdictFor(value, criteria) === 'not-viable'
                    ? 'notViable'
                    : verdictFor(value, criteria)
                }`
              )
            : `${value}%`,
        },
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
            <span
              className={classNames('text-slate-100', {
                'font-mono': !(beginner && item.key === 'value'),
              })}
            >
              {item.text}
            </span>
          </span>
        ))
      ) : (
        <span className="text-slate-500">{t('planner.hint')}</span>
      )}
    </div>
  );
}
