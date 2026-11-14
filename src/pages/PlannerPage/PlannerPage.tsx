import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import BestWindowsList from '@/features/planner/BestWindowsList/BestWindowsList';
import {
  demoPlannerDates,
  demoPlannerSites,
  demoPlannerValues,
  type PlannerMetric,
} from '@/features/planner/demoPlanner';
import HeatmapTooltip from '@/features/planner/HeatmapTooltip/HeatmapTooltip';
import MetricToggle from '@/features/planner/MetricToggle/MetricToggle';
import ViabilityHeatmap, {
  type HoveredCell,
} from '@/features/planner/ViabilityHeatmap/ViabilityHeatmap';

export default function PlannerPage() {
  const { t } = useTranslation();
  // Only toggles the display; there are no calculations
  const [metric, setMetric] = useState<PlannerMetric>('sunlight');
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const values = demoPlannerValues[metric];
  const hoveredValue = hovered ? values[hovered.row]?.[hovered.col] : undefined;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">{t('planner.demoNote')}</p>

      <Panel className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle>{t('planner.heatmap.title')}</SectionTitle>
          <MetricToggle value={metric} onChange={setMetric} />
        </div>

        <ViabilityHeatmap
          values={values}
          hovered={hovered}
          onHover={setHovered}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <HeatmapTooltip
            site={hovered ? demoPlannerSites[hovered.row]?.name : undefined}
            date={hovered ? demoPlannerDates[hovered.col] : undefined}
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
        <BestWindowsList values={values} />
      </Panel>
    </div>
  );
}
