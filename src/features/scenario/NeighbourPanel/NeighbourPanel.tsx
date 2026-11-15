import classNames from 'classnames';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import TitleWithHint from '@/components/ui/TitleWithHint/TitleWithHint';
import type { Criteria } from '@/domain/criteria/criteria';
import type { ScenarioView } from '@/features/scenario/demoScenario';
import { useNeighbours } from '@/features/scenario/useNeighbours/useNeighbours';
import { useMode } from '@/hooks/useMode/useMode';
import { formatDurationFor } from '@/lib/formatDuration/formatDuration';
import { useScenarioStore } from '@/state/useScenarioStore/useScenarioStore';

const DISTANCES = ['2', '5', '10'] as const;
type DistanceKey = (typeof DISTANCES)[number];

interface NeighbourPanelProps {
  center: { lat: number; lon: number } | null;
  epoch: Date;
  durationDays: number;
  criteria: Criteria;
  /** The calculated scenario of the site itself; null while its data is loading */
  siteView: ScenarioView | null;
  className?: string;
}

interface Row {
  key: string;
  label: string;
  coordinates: { lat: number; lon: number } | null;
  view: ScenarioView | null;
}

/** The difference from the site itself, e.g. "+12" in green or "−8" in red. */
function Delta({ value, base }: { value: number; base: number | undefined }) {
  if (base === undefined || value === base) return null;
  const difference = value - base;
  return (
    <span
      className={classNames(
        'ml-1 text-xs',
        difference > 0 ? 'text-emerald-300' : 'text-red-300'
      )}
    >
      {difference > 0 ? `+${difference}` : `−${-difference}`}
    </span>
  );
}

/**
 * The same scenario a few kilometers north, east, south and west of the site.
 * Shows why a small change of the landing point can change the verdict near the pole.
 */
export default function NeighbourPanel({
  center,
  epoch,
  durationDays,
  criteria,
  siteView,
  className,
}: NeighbourPanelProps) {
  const { t } = useTranslation();
  const beginner = useMode() === 'beginner';
  const setCustomSite = useScenarioStore((state) => state.setCustomSite);
  const [distance, setDistance] = useState<DistanceKey>('5');
  const km = Number(distance);
  const { state, calculate } = useNeighbours({
    center,
    epoch,
    durationDays,
    distanceKm: km,
    criteria,
  });

  if (!center) return null;

  const rows: Row[] = [
    {
      key: 'site',
      label: t('scenario.neighbours.site'),
      coordinates: null,
      view: siteView,
    },
    ...(state.status === 'ready'
      ? state.rows.map((row): Row => ({
          key: row.point.direction,
          label: t(`scenario.neighbours.direction.${row.point.direction}`, {
            km,
          }),
          coordinates: { lat: row.point.lat, lon: row.point.lon },
          view: row.status === 'ready' ? row.view : null,
        }))
      : []),
  ];

  const views = rows.flatMap((row) => (row.view ? [row.view] : []));
  const range = (pick: (view: ScenarioView) => number) => {
    const values = views.map(pick);
    return { min: Math.min(...values), max: Math.max(...values) };
  };
  const sunRange = range((view) => view.sunlightPercent);
  const earthRange = range((view) => view.earthLinkPercent);

  const percentCell = (
    view: ScenarioView | null,
    pick: (view: ScenarioView) => number
  ) =>
    view ? (
      <>
        {pick(view)}%
        <Delta
          value={pick(view)}
          base={siteView ? pick(siteView) : undefined}
        />
      </>
    ) : (
      '—'
    );

  return (
    <Panel className={classNames('flex flex-col gap-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TitleWithHint hint={t('help.neighbours')}>
          {t('scenario.neighbours.title')}
        </TitleWithHint>
        <SegmentedControl<DistanceKey>
          label={t('scenario.neighbours.distance')}
          value={distance}
          onChange={setDistance}
          options={DISTANCES.map((value) => ({
            value,
            label: t('scenario.neighbours.km', { value }),
          }))}
        />
      </div>

      <p className="max-w-prose text-sm text-slate-400">
        {t('scenario.neighbours.intro', { km })}
      </p>

      {state.status === 'idle' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled={!siteView} onClick={calculate}>
            {t('scenario.neighbours.calculate')}
          </Button>
          <span className="text-xs text-slate-500">
            {siteView
              ? t('scenario.neighbours.cost')
              : t('scenario.neighbours.waiting')}
          </span>
        </div>
      )}
      {state.status === 'loading' && (
        <p className="text-sm text-slate-400" role="status">
          {t('scenario.neighbours.loading')}
        </p>
      )}
      {state.status === 'error' && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-400">
            {t('scenario.neighbours.error')}
          </p>
          <Button onClick={calculate}>{t('scenario.neighbours.retry')}</Button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          {views.length > 1 && (
            <p className="text-sm text-slate-200">
              {t('scenario.neighbours.spread', {
                sunMin: sunRange.min,
                sunMax: sunRange.max,
                earthMin: earthRange.min,
                earthMax: earthRange.max,
              })}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-[11px] tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.neighbours.point')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.verdict.title')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.verdict.sunlight')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.verdict.earthLink')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.verdict.window')}
                  </th>
                  <th className="py-1.5 pr-3 font-semibold">
                    {t('scenario.verdict.longestDarkness')}
                  </th>
                  <th className="py-1.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={classNames({ 'bg-white/5': !row.coordinates })}
                  >
                    <td className="py-2 pr-3 text-slate-200">
                      {row.label}
                      {row.coordinates && !beginner && (
                        <span className="block font-mono text-xs text-slate-500">
                          {row.coordinates.lat.toFixed(4)}°,{' '}
                          {row.coordinates.lon.toFixed(4)}°
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {row.view ? (
                        <Badge verdict={row.view.verdict} />
                      ) : (
                        <span className="text-xs text-slate-500">
                          {t('scenario.neighbours.noData')}
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-100">
                      {percentCell(row.view, (view) => view.sunlightPercent)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-100">
                      {percentCell(row.view, (view) => view.earthLinkPercent)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-100">
                      {percentCell(row.view, (view) => view.windowPercent)}
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-100">
                      {row.view
                        ? formatDurationFor(
                            t,
                            row.view.longestDarkness,
                            beginner
                          )
                        : '—'}
                    </td>
                    <td className="py-2 text-right">
                      {row.coordinates && (
                        <Button
                          className="px-2 py-1 text-xs"
                          aria-label={t('scenario.neighbours.openAria', {
                            point: row.label,
                          })}
                          onClick={() => {
                            if (row.coordinates) setCustomSite(row.coordinates);
                          }}
                        >
                          {t('scenario.neighbours.open')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}
