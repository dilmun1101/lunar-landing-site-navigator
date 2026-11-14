import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import Panel from '@/components/ui/Panel/Panel';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { formatDuration } from '@/lib/formatDuration/formatDuration';
import { formatUtcDateTime } from '@/lib/format/format';

interface ScenarioCardProps {
  scenario: ScenarioView;
  className?: string;
}

export default function ScenarioCard({
  scenario,
  className,
}: ScenarioCardProps) {
  const { t, i18n } = useTranslation();
  const elevation = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always',
  }).format(scenario.sun.elevation);

  const stats = [
    { key: 'solarElevation', value: `${elevation}°` },
    {
      key: 'sunlightDuration',
      value: formatDuration(t, scenario.sunlightDuration),
    },
    {
      key: 'earthWindow',
      value: formatDuration(t, scenario.earthWindowDuration),
    },
  ];

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-100">{scenario.siteName}</h3>
          <p className="font-mono text-xs text-slate-500">
            {formatUtcDateTime(scenario.epoch, i18n.language)} UTC
          </p>
        </div>
        <Badge verdict={scenario.verdict} />
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div key={stat.key}>
            <dt className="text-[11px] tracking-wider text-slate-500 uppercase">
              {t(`compare.card.${stat.key}`)}
            </dt>
            <dd className="font-mono text-sm text-slate-100">{stat.value}</dd>
          </div>
        ))}
      </dl>

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

      <button
        type="button"
        className="self-end text-xs text-slate-500 hover:text-accent"
      >
        {t('compare.card.remove')}
      </button>
    </Panel>
  );
}
