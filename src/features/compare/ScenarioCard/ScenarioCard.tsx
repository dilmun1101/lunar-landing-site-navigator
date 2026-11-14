import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import Panel from '@/components/ui/Panel/Panel';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { useMode } from '@/hooks/useMode/useMode';
import { formatDurationFor } from '@/lib/formatDuration/formatDuration';
import { formatUtcDateTime } from '@/lib/format/format';

interface ScenarioCardProps {
  scenario: ScenarioView;
  onRemove?: () => void;
  className?: string;
}

export default function ScenarioCard({
  scenario,
  onRemove,
  className,
}: ScenarioCardProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';
  const elevation = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(scenario.sun.elevation);

  const dayFormat = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 0,
  });
  const ticks = Array.from(
    { length: Math.floor(scenario.durationDays / 5) + 1 },
    (_, index) => index * 5
  );

  const stats = [
    // The sun angle in degrees means little to a beginner
    ...(beginner
      ? []
      : [{ key: 'solarElevation', value: `${elevation}°`, dot: 'bg-sun' }]),
    {
      key: 'sunlightDuration',
      value: formatDurationFor(t, scenario.sunlightDuration, beginner),
      dot: 'bg-sun',
    },
    {
      key: 'earthWindow',
      value: formatDurationFor(t, scenario.earthWindowDuration, beginner),
      dot: 'bg-earth',
    },
  ];

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-100">{scenario.siteName}</h3>
          <p className="font-mono text-xs text-slate-500">
            {beginner
              ? new Intl.DateTimeFormat(i18n.language, {
                  timeZone: 'UTC',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(scenario.epoch)
              : `${formatUtcDateTime(scenario.epoch, i18n.language)} UTC`}
          </p>
        </div>
        <Badge verdict={scenario.verdict} />
      </div>

      <dl
        className={classNames('grid gap-2', {
          'grid-cols-3': !beginner,
          'grid-cols-2': beginner,
        })}
      >
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 p-2.5"
          >
            <dt className="flex items-start gap-1.5 text-[11px] leading-tight tracking-wider text-slate-400 uppercase">
              <span
                className={classNames(
                  'mt-0.5 size-2 shrink-0 rounded-full',
                  stat.dot
                )}
              />
              {t(`compare.card.${stat.key}`)}
            </dt>
            <dd className="mt-auto font-mono text-sm text-slate-100">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <p
        className={classNames('text-xs', {
          'text-slate-400': !scenario.blackoutExceeded,
          'text-red-300': scenario.blackoutExceeded,
        })}
      >
        {t('compare.card.longestDarkness')}:{' '}
        <span className="font-mono text-slate-100">
          {formatDurationFor(t, scenario.longestDarkness, beginner)}
        </span>
        {scenario.blackoutExceeded
          ? ` — ${t('scenario.verdict.blackoutExceeded')}`
          : null}
      </p>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-[11px] tracking-wider text-slate-400 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            {t('scenario.verdict.window')}
          </span>
          <span className="font-mono text-slate-100 normal-case">
            {new Intl.NumberFormat(i18n.language, {
              style: 'percent',
              maximumFractionDigits: 0,
            }).format(scenario.windowPercent / 100)}
          </span>
        </div>
        <div className="relative h-2 rounded bg-white/5">
          {scenario.windowSegments.map(([start, end]) => (
            <div
              key={`${start}-${end}`}
              className="absolute inset-y-0 rounded-sm bg-emerald-400/90"
              style={{
                left: `${(start / scenario.durationDays) * 100}%`,
                width: `${((end - start) / scenario.durationDays) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative h-3 font-mono text-[10px] text-slate-500">
          {ticks.map((tick) => (
            <span
              key={tick}
              className={classNames('absolute', {
                'translate-x-0': tick === 0,
                '-translate-x-1/2': tick !== 0,
              })}
              style={{ left: `${(tick / scenario.durationDays) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-500">
          {t('scenario.timeline.axis')}
        </p>
        {!beginner && (
          <p className="text-xs text-slate-400">
            {t('compare.card.windowDays')}:{' '}
            <span className="font-mono text-slate-100">
              {scenario.windowSegments
                .map(
                  ([start, end]) =>
                    `${dayFormat.format(start)}–${dayFormat.format(end)}`
                )
                .join(', ')}
            </span>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="self-end text-xs text-slate-500 hover:text-accent"
      >
        {t('compare.card.remove')}
      </button>
    </Panel>
  );
}
