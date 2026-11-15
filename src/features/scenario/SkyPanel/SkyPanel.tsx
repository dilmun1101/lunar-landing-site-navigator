import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import type { SkyPoint } from '@/features/scenario/demoScenario';
import { useMode } from '@/hooks/useMode/useMode';
import Legend from '@/features/scenario/Legend/Legend';
import PolarSkyChart from '@/features/scenario/PolarSkyChart/PolarSkyChart';

interface SkyPanelProps {
  sun: SkyPoint;
  earth: SkyPoint;
  sunTrack: SkyPoint[];
  earthTrack: SkyPoint[];
  horizon: number[];
  className?: string;
}

export default function SkyPanel({
  sun,
  earth,
  sunTrack,
  earthTrack,
  horizon,
  className,
}: SkyPanelProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';

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
      <SectionTitle>{t('scenario.sky.title')}</SectionTitle>

      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="flex flex-col gap-2">
          <PolarSkyChart
            sun={sun}
            earth={earth}
            sunTrack={sunTrack}
            earthTrack={earthTrack}
            horizon={horizon}
          />
          <p className="text-xs text-slate-500">
            {t('scenario.polar.elevationNote')}
          </p>
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
          <p className="text-xs text-slate-500">
            {t('scenario.polar.trackNote')}
          </p>
        </div>
      </div>
    </Panel>
  );
}
