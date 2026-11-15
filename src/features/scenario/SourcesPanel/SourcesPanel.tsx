import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import type { Criteria } from '@/domain/criteria/criteria';
import { useMode } from '@/hooks/useMode/useMode';

interface SourcesPanelProps {
  criteria: Criteria;
  /** false — LOLA was not available, the horizon is flat */
  hasTerrain: boolean;
  className?: string;
}

/** Expert mode: where the numbers come from and which thresholds are applied */
export default function SourcesPanel({
  criteria,
  hasTerrain,
  className,
}: SourcesPanelProps) {
  const { t } = useTranslation();
  if (useMode() !== 'expert') return null;

  const thresholds = [
    ['minSunElevation', `${criteria.minSunElevation}°`],
    ['minEarthElevation', `${criteria.minEarthElevation}°`],
    ['minWindowHours', `${criteria.minWindowHours} ${t('sources.hoursShort')}`],
    [
      'maxBlackoutHours',
      criteria.maxBlackoutHours > 0
        ? `${criteria.maxBlackoutHours} ${t('sources.hoursShort')}`
        : t('sources.off'),
    ],
    ['viablePercent', `≥ ${criteria.viablePercent}%`],
    ['marginalPercent', `≥ ${criteria.marginalPercent}%`],
  ] as const;

  const linkClass = 'text-earth underline-offset-2 hover:underline';

  return (
    <Panel className={classNames('flex flex-col gap-4', className)}>
      <SectionTitle>{t('sources.title')}</SectionTitle>

      <dl className="grid gap-x-6 gap-y-3 text-sm md:grid-cols-[10rem_1fr]">
        <dt className="text-slate-500">{t('sources.ephemeris')}</dt>
        <dd className="text-slate-200">
          {t('sources.ephemerisText')}{' '}
          <a
            className={linkClass}
            href="https://ssd.jpl.nasa.gov/horizons/"
            target="_blank"
            rel="noreferrer"
          >
            JPL Horizons
          </a>
        </dd>

        <dt className="text-slate-500">{t('sources.terrain')}</dt>
        <dd className="text-slate-200">
          {hasTerrain ? t('sources.terrainText') : t('sources.terrainFlat')}{' '}
          <a
            className={linkClass}
            href="https://astrogeology.usgs.gov/"
            target="_blank"
            rel="noreferrer"
          >
            USGS Astrogeology
          </a>
        </dd>

        <dt className="text-slate-500">{t('sources.libration')}</dt>
        <dd className="text-slate-200">{t('sources.librationText')}</dd>

        <dt className="text-slate-500">{t('sources.validation')}</dt>
        <dd className="text-slate-200">{t('sources.validationText')}</dd>

        <dt className="text-slate-500">{t('sources.criteria')}</dt>
        <dd className="flex flex-col gap-1.5 text-slate-200">
          <ul className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {thresholds.map(([key, value]) => (
              <li key={key} className="flex justify-between gap-3">
                <span className="text-slate-400">{t(`criteria.${key}`)}</span>
                <span className="font-mono text-slate-100">{value}</span>
              </li>
            ))}
          </ul>
          <span className="text-xs text-slate-500">
            {t('sources.assumption')}
          </span>
        </dd>
      </dl>
    </Panel>
  );
}
