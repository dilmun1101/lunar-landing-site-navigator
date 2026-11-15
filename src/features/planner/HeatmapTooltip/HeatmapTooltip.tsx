import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import { verdictFor } from '@/domain/metrics/verdict/verdict';
import type { SiteCoordinates } from '@/features/sites/types';
import { useMode } from '@/hooks/useMode/useMode';

/** Extra data about the hovered cell — shown in expert mode only */
export interface HeatmapDetails {
  coordinates: SiteCoordinates;
  /** Percent of the mission for the cell's start date, by every metric */
  metrics: { sunlight: number; comms: number; window: number };
  /** The best start of this site by the chosen metric */
  best: { startMs: number; percent: number } | null;
}

interface HeatmapTooltipProps {
  site?: string;
  date?: Date;
  /** Percent, 0–100 */
  value?: number;
  criteria?: Criteria;
  details?: HeatmapDetails;
  className?: string;
}

export default function HeatmapTooltip({
  site,
  date,
  value,
  criteria = defaultCriteria,
  details,
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

  const dateOnly = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const percent = (value: number) => `${value}%`;
  // South is negative latitude, west is negative longitude
  const coordinatesText = details
    ? `${details.coordinates.approximate ? '≈ ' : ''}${details.coordinates.lat.toFixed(2)}°, ${details.coordinates.lon.toFixed(2)}°`
    : '';
  const expertRows =
    !beginner && hasCell && details
      ? [
          { key: 'coordinates', text: coordinatesText },
          {
            key: 'metrics',
            text: [
              `${t('planner.metric.sunlight')}: ${percent(details.metrics.sunlight)}`,
              `${t('planner.metric.comms')}: ${percent(details.metrics.comms)}`,
              `${t('planner.metric.window')}: ${percent(details.metrics.window)}`,
            ].join(' · '),
          },
          {
            key: 'best',
            text: details.best
              ? `${dateOnly.format(details.best.startMs)} — ${percent(details.best.percent)}`
              : '—',
          },
        ]
      : [];

  return (
    <div
      className={classNames('flex min-h-10 flex-col gap-1 text-sm', className)}
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
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
      {expertRows.map((row) => (
        <span key={row.key} className="flex flex-wrap gap-2">
          <span className="text-slate-500">
            {t(`planner.tooltip.${row.key}`)}
          </span>
          <span className="font-mono text-slate-100">{row.text}</span>
        </span>
      ))}
    </div>
  );
}
