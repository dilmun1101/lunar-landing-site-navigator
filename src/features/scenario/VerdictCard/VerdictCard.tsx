import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import MetricTile from '@/components/ui/MetricTile/MetricTile';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import { addDays } from '@/domain/time/lunarDay/lunarDay';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { formatUtcDateTime } from '@/lib/format/format';

interface VerdictCardProps {
  scenario: ScenarioView;
  /** E.g. sunset timers — shown on the right of the card header */
  children?: ReactNode;
  className?: string;
}

export default function VerdictCard({
  scenario,
  children,
  className,
}: VerdictCardProps) {
  const { t, i18n } = useTranslation();
  const start = formatUtcDateTime(scenario.epoch, i18n.language);
  const end = formatUtcDateTime(
    addDays(scenario.epoch, scenario.durationDays),
    i18n.language
  );

  return (
    <Panel className={classNames('flex flex-col gap-5', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SectionTitle>{t('scenario.verdict.title')}</SectionTitle>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-100">
              {scenario.siteName}
            </h1>
            <Badge verdict={scenario.verdict} />
          </div>
          <p className="text-sm text-slate-400">
            {t('scenario.verdict.missionWindow')}:{' '}
            <span className="font-mono">
              {start} – {end} UTC
            </span>
          </p>
        </div>
        {children}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile
          label={t('scenario.verdict.sunlight')}
          percent={scenario.sunlightPercent}
          color="sun"
        />
        <MetricTile
          label={t('scenario.verdict.earthLink')}
          percent={scenario.earthLinkPercent}
          color="earth"
        />
        <MetricTile
          label={t('scenario.verdict.window')}
          percent={scenario.windowPercent}
          color="emerald"
        />
      </div>
    </Panel>
  );
}
