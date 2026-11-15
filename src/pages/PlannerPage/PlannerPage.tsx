import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Button from '@/components/ui/Button/Button';
import Hint from '@/components/ui/Tooltip/Tooltip';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import TitleWithHint from '@/components/ui/TitleWithHint/TitleWithHint';
import {
  plannerStarts,
  type PlannerMetric,
} from '@/domain/planner/plannerValues/plannerValues';
import BestWindowsList, {
  type BestWindow,
  type CompareState,
} from '@/features/planner/BestWindowsList/BestWindowsList';
import HeatmapTooltip, {
  type HeatmapDetails,
} from '@/features/planner/HeatmapTooltip/HeatmapTooltip';
import MetricToggle from '@/features/planner/MetricToggle/MetricToggle';
import { plannerSites } from '@/features/planner/plannerSites';
import { usePlannerData } from '@/features/planner/usePlannerData/usePlannerData';
import ViabilityHeatmap, {
  type HoveredCell,
} from '@/features/planner/ViabilityHeatmap/ViabilityHeatmap';
import { useMode } from '@/hooks/useMode/useMode';
import {
  MAX_COMPARE_ITEMS,
  useCompareList,
} from '@/state/useCompareList/useCompareList';
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
  const selectSite = useScenarioStore((state) => state.selectSite);
  const setEpoch = useScenarioStore((state) => state.setEpoch);
  const addToCompare = useCompareList((state) => state.add);
  const compareItems = useCompareList((state) => state.items);
  const navigate = useNavigate();
  const beginner = useMode() === 'beginner';
  const [expertMetric, setMetric] = useState<PlannerMetric>('window');
  // A beginner sees one simple picture: light and Earth link together
  const metric: PlannerMetric = beginner ? 'window' : expertMetric;
  const [hovered, setHovered] = useState<HoveredCell | null>(null);
  // A click pins a cell: its details stay below until another cell is picked
  const [selected, setSelected] = useState<HoveredCell | null>(null);
  // The pointer shows a preview; without it the pinned cell is shown
  const shownCell = hovered ?? selected;

  const days = durationDays[duration];
  // Columns start at the beginning of the selected UTC day
  const startMs = Math.floor(epoch.getTime() / DAY_MS) * DAY_MS;
  const dates = plannerStarts(startMs).map((ms) => new Date(ms));
  const { states, reload } = usePlannerData(startMs, days, criteria, metric);

  const values = plannerSites.map((site) => {
    const state = states[site.id];
    return state?.status === 'ready' ? state.values[metric] : null;
  });
  const bestWindows = plannerSites.flatMap((site): BestWindow[] => {
    const state = states[site.id];
    return state?.status === 'ready' && state.best
      ? [{ site, startMs: state.best.startMs, percent: state.best.percent }]
      : [];
  });

  // Opens the window in the scenario: the same site and start time
  const openWindow = (window: BestWindow) => {
    selectSite(window.site.id);
    setEpoch(new Date(window.startMs));
    void navigate('/scenario');
  };
  const addWindow = (window: BestWindow) =>
    addToCompare({
      siteName: window.site.name,
      epoch: new Date(window.startMs).toISOString(),
      duration,
      coordinates: window.site.coordinates,
    });

  // The list ignores duplicates and more than MAX_COMPARE_ITEMS scenarios, so the button says why
  const compareState = (window: BestWindow): CompareState => {
    const epoch = new Date(window.startMs).toISOString();
    if (
      compareItems.some(
        (item) =>
          item.siteName === window.site.name &&
          item.epoch === epoch &&
          item.duration === duration
      )
    ) {
      return 'added';
    }
    return compareItems.length >= MAX_COMPARE_ITEMS ? 'full' : 'add';
  };

  const shownValue = shownCell
    ? values[shownCell.row]?.[shownCell.col]
    : undefined;
  const shownSite = shownCell ? plannerSites[shownCell.row] : undefined;
  const shownState = shownSite ? states[shownSite.id] : undefined;
  let details: HeatmapDetails | undefined;
  if (shownCell && shownSite && shownState?.status === 'ready') {
    const { sunlight, comms, window } = shownState.values;
    details = {
      coordinates: shownSite.coordinates,
      metrics: {
        sunlight: sunlight[shownCell.col] ?? 0,
        comms: comms[shownCell.col] ?? 0,
        window: window[shownCell.col] ?? 0,
      },
      best: shownState.best,
    };
  }

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
          {beginner
            ? t('planner.dataNoteBeginner', { days: Math.round(days) })
            : t('planner.dataNote', { days: Math.round(days) })}
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

      <Panel className="flex flex-col gap-3">
        <TitleWithHint hint={t('help.bestWindows')}>
          {t('planner.best.title')}
        </TitleWithHint>
        <BestWindowsList
          windows={bestWindows}
          criteria={criteria}
          onOpen={openWindow}
          onAdd={addWindow}
          compareState={compareState}
        />
      </Panel>

      <Panel className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SectionTitle>{t('planner.heatmap.title')}</SectionTitle>
            <Hint text={t('hints.heatmap')} />
          </div>
          {!beginner && <MetricToggle value={metric} onChange={setMetric} />}
        </div>

        <ViabilityHeatmap
          sites={plannerSites}
          dates={dates}
          values={values}
          hovered={hovered}
          onHover={setHovered}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <HeatmapTooltip
            site={shownCell ? plannerSites[shownCell.row]?.name : undefined}
            date={shownCell ? dates[shownCell.col] : undefined}
            value={shownValue}
            criteria={criteria}
            details={details}
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
    </div>
  );
}
