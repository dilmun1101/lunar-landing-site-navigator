import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import {
  plannerStarts,
  type PlannerMetric,
} from '@/domain/planner/plannerValues/plannerValues';
import BestWindowsList from '@/features/planner/BestWindowsList/BestWindowsList';
import HeatmapTooltip from '@/features/planner/HeatmapTooltip/HeatmapTooltip';
import MetricToggle from '@/features/planner/MetricToggle/MetricToggle';
import { plannerSites } from '@/features/planner/plannerSites';
import { usePlannerData } from '@/features/planner/usePlannerData/usePlannerData';
import ViabilityHeatmap, {
  type HoveredCell,
} from '@/features/planner/ViabilityHeatmap/ViabilityHeatmap';
import { useCriteriaStore } from '@/state/useCriteriaStore/useCriteriaStore';
import {
  durationDays,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

const DAY_MS = 86_400_000;

export default function PlannerPage() {
  const { t } = useTranslation();
  const epoch = useScenarioStore((state) => state.epoch);
  const duration = useScenarioStore((state) => state.duration);
  const criteria = useCriteriaStore((state) => state.criteria);
  const [metric, setMetric] = useState<PlannerMetric>('window');
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const days = durationDays[duration];
  // Columns start at the beginning of the selected UTC day
  const startMs = Math.floor(epoch.getTime() / DAY_MS) * DAY_MS;
  const dates = plannerStarts(startMs).map((ms) => new Date(ms));
  const { states, reload } = usePlannerData(startMs, days, criteria);

  const values = plannerSites.map((site) => {
    const state = states[site.id];
    return state?.status === 'ready' ? state.values[metric] : null;
  });
  const hoveredValue = hovered ? values[hovered.row]?.[hovered.col] : undefined;

  const rows = plannerSites.map((site) => states[site.id]);
  const ready = rows.filter((row) => row?.status === 'ready').length;
  const failed = rows.filter((row) => row?.status === 'error').length;
  const flatSites = plannerSites
    .filter((site) => {
      const state = states[site.id];
      return state?.status === 'ready' && !state.terrain;
    })
    .map((site) => site.name);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-slate-500">
          {t('planner.dataNote', { days: Math.round(days) })}
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {ready + failed < plannerSites.length
              ? t('planner.progress', {
                  done: ready,
                  total: plannerSites.length,
                })
              : null}
            {failed > 0 ? ` ${t('planner.failed', { count: failed })}` : null}
            {flatSites.length > 0
              ? ` ${t('planner.flatNote', { sites: flatSites.join(', ') })}`
              : null}
          </p>
          {(failed > 0 || flatSites.length > 0) && (
            <Button className="shrink-0 px-2 py-1 text-xs" onClick={reload}>
              {t('common.refresh')}
            </Button>
          )}
        </div>
      </div>

      <Panel className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>{t('planner.heatmap.title')}</SectionTitle>
          <MetricToggle value={metric} onChange={setMetric} />
        </div>

        <ViabilityHeatmap
          sites={plannerSites}
          dates={dates}
          values={values}
          hovered={hovered}
          onHover={setHovered}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <HeatmapTooltip
            site={hovered ? plannerSites[hovered.row]?.name : undefined}
            date={hovered ? dates[hovered.col] : undefined}
            value={hoveredValue}
          />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {t('planner.legend.low')}
            <span
              className="h-2 w-28 rounded-full"
              style={{
                background:
                  'linear-gradient(to right, rgb(52 211 153 / 0.05), rgb(52 211 153))',
              }}
            />
            {t('planner.legend.high')}
          </div>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3">
        <SectionTitle>{t('planner.best.title')}</SectionTitle>
        <BestWindowsList
          sites={plannerSites}
          dates={dates}
          values={values}
          criteria={criteria}
        />
      </Panel>
    </div>
  );
}
