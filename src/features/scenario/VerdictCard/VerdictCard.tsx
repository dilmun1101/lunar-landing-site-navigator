import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import Hint from '@/components/ui/Tooltip/Tooltip';
import MetricTile from '@/components/ui/MetricTile/MetricTile';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import { verdictSentence } from '@/domain/metrics/verdictSentence/verdictSentence';
import { addDays } from '@/domain/time/lunarDay/lunarDay';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { useMode } from '@/hooks/useMode/useMode';
import { formatDurationFor } from '@/lib/formatDuration/formatDuration';
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
  const beginner = useMode() === 'beginner';
  const endDate = addDays(scenario.epoch, scenario.durationDays);
  // Beginners get calendar dates only: no hours, minutes or time zone
  const dayFormat = new Intl.DateTimeFormat(i18n.language, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const start = beginner
    ? dayFormat.format(scenario.epoch)
    : formatUtcDateTime(scenario.epoch, i18n.language);
  const end = beginner
    ? dayFormat.format(endDate)
    : formatUtcDateTime(endDate, i18n.language);

  const sentence = beginner
    ? verdictSentence({
        verdict: scenario.verdict,
        sunlightPercent: scenario.sunlightPercent,
        earthLinkPercent: scenario.earthLinkPercent,
        blackoutExceeded: scenario.blackoutExceeded,
      })
    : null;

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
              {start} – {end}
              {beginner ? '' : ' UTC'}
            </span>
          </p>
          {sentence && (
            <p className="max-w-prose text-sm leading-relaxed text-slate-200">
              <span className="font-semibold">
                {t(
                  `scenario.sentence.intro.${
                    sentence.verdict === 'not-viable'
                      ? 'notViable'
                      : sentence.verdict
                  }`
                )}
              </span>{' '}
              {t('scenario.sentence.body', {
                sun: t(`scenario.sentence.freq.${sentence.sun}`),
                earth: t(`scenario.sentence.freq.${sentence.earth}`),
              })}
              {sentence.reason
                ? ` ${t(`scenario.sentence.reason.${sentence.reason}`)}`
                : null}
            </p>
          )}
        </div>
        {children}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricTile
          label={t('scenario.verdict.sunlight')}
          hint={t('hints.sunlight')}
          percent={scenario.sunlightPercent}
          color="sun"
        />
        <MetricTile
          label={t(
            beginner
              ? 'scenario.verdict.earthLink'
              : 'scenario.verdict.earthLinkExpert'
          )}
          hint={t('hints.earthLink')}
          percent={scenario.earthLinkPercent}
          color="earth"
        />
        <MetricTile
          label={t('scenario.verdict.window')}
          hint={t('hints.window')}
          percent={scenario.windowPercent}
          color="emerald"
        />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div
          className={classNames(
            'flex flex-col gap-0.5 rounded-lg border px-3 py-2',
            scenario.blackoutExceeded
              ? 'border-red-400/50 bg-red-400/10'
              : 'border-white/10 bg-white/5'
          )}
        >
          <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {t('scenario.verdict.longestDarkness')}
            <Hint text={t('hints.longestDarkness')} />
          </dt>
          <dd className="font-mono text-sm text-slate-100">
            {formatDurationFor(t, scenario.longestDarkness, beginner)}
          </dd>
          {scenario.blackoutExceeded && (
            <dd className="text-xs text-red-300">
              {t('scenario.verdict.blackoutExceeded')}
            </dd>
          )}
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {t('scenario.verdict.longestCommsGap')}
            <Hint text={t('hints.longestCommsGap')} />
          </dt>
          <dd className="font-mono text-sm text-slate-100">
            {formatDurationFor(t, scenario.longestCommsGap, beginner)}
          </dd>
        </div>
      </dl>
    </Panel>
  );
}
