import classNames from 'classnames';
import { lazy, Suspense, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import TitleWithHint from '@/components/ui/TitleWithHint/TitleWithHint';
import type { SkyPoint } from '@/features/scenario/demoScenario';
import { useMode } from '@/hooks/useMode/useMode';
import Legend from '@/features/scenario/Legend/Legend';
import GlobeBoundary from '@/features/scenario/MoonGlobe/GlobeBoundary';
import PolarSkyChart from '@/features/scenario/PolarSkyChart/PolarSkyChart';
import { webglAvailable } from '@/lib/webgl/webglAvailable';

// three.js is heavy: the globe is loaded only when someone switches to 3D.
const MoonGlobe = lazy(() => import('@/features/scenario/MoonGlobe/MoonGlobe'));

type SkyView = 'flat' | 'globe';

interface SkyPanelProps {
  sun: SkyPoint;
  earth: SkyPoint;
  sunTrack: SkyPoint[];
  earthTrack: SkyPoint[];
  horizon: number[];
  /** Site coordinates: with them the 2D / 3D switch appears */
  site?: { lat: number; lon: number };
  /** E.g. links to external maps — shown under the chart */
  footer?: ReactNode;
  className?: string;
}

export default function SkyPanel({
  sun,
  earth,
  sunTrack,
  earthTrack,
  horizon,
  site,
  footer,
  className,
}: SkyPanelProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';
  const [view, setView] = useState<SkyView>('flat');
  const canShowGlobe = site !== undefined && webglAvailable();
  const globe = canShowGlobe && view === 'globe';

  const elevationFormat = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always',
  });
  const azimuthFormat = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 0,
  });

  const rows = [
    { key: 'sun', dot: 'bg-sun', point: sun },
    { key: 'earth', dot: 'bg-earth', point: earth },
  ];

  return (
    <Panel className={classNames('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TitleWithHint hint={t('help.sky')}>
          {t('scenario.sky.title')}
        </TitleWithHint>
        {canShowGlobe && (
          <SegmentedControl<SkyView>
            label={t('scenario.sky.view.label')}
            value={view}
            onChange={setView}
            options={[
              { value: 'flat', label: t('scenario.sky.view.flat') },
              { value: 'globe', label: t('scenario.sky.view.globe') },
            ]}
          />
        )}
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="flex flex-col gap-2">
          {globe && site ? (
            <GlobeBoundary
              fallback={
                <p className="text-sm text-slate-400">
                  {t('scenario.globe.error')}
                </p>
              }
            >
              <Suspense
                fallback={
                  <p className="text-sm text-slate-400">
                    {t('scenario.globe.loading')}
                  </p>
                }
              >
                <MoonGlobe
                  lat={site.lat}
                  lon={site.lon}
                  sun={sun}
                  earth={earth}
                  ariaLabel={t('scenario.globe.aria')}
                  className="aspect-square w-full"
                />
              </Suspense>
            </GlobeBoundary>
          ) : (
            <PolarSkyChart
              sun={sun}
              earth={earth}
              sunTrack={sunTrack}
              earthTrack={earthTrack}
              horizon={horizon}
            />
          )}
          {globe ? (
            <p className="text-xs text-slate-500">{t('scenario.globe.note')}</p>
          ) : (
            !beginner && (
              <p className="text-xs text-slate-500">
                {t('scenario.polar.elevationNote')}
              </p>
            )
          )}
        </div>

        <div className="flex flex-col gap-4">
          {beginner ? (
            <ul className="flex flex-col gap-2 text-sm">
              {rows.map((row) => (
                <li
                  key={row.key}
                  className="flex items-center gap-2 text-slate-200"
                >
                  <span
                    className={classNames('size-2.5 rounded-full', row.dot)}
                  />
                  {t(
                    row.point.elevation > 0
                      ? `scenario.sky.${row.key}Up`
                      : `scenario.sky.${row.key}Down`
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] tracking-wider text-slate-500 uppercase">
                  <th scope="col" className="pb-2 text-left font-semibold" />
                  <th scope="col" className="pb-2 text-right font-semibold">
                    {t('scenario.sky.elevation')}
                  </th>
                  <th scope="col" className="pb-2 text-right font-semibold">
                    {t('scenario.sky.azimuth')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-white/10">
                    <td className="py-2">
                      <span className="flex items-center gap-2 text-slate-200">
                        <span
                          className={classNames(
                            'size-2.5 rounded-full',
                            row.dot
                          )}
                        />
                        {t(`scenario.legend.${row.key}`)}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-100">
                      {elevationFormat.format(row.point.elevation)}°
                    </td>
                    <td className="py-2 text-right font-mono text-slate-100">
                      {azimuthFormat.format(row.point.azimuth)}°
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Legend />
          {!globe && (
            <p className="text-xs text-slate-500">
              {t('scenario.polar.trackNote')}
            </p>
          )}
        </div>
      </div>

      {footer && <div className="border-t border-white/10 pt-4">{footer}</div>}
    </Panel>
  );
}
