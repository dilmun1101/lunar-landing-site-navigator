import { useTranslation } from 'react-i18next';
import CountdownChips from '@/features/scenario/CountdownChips/CountdownChips';
import {
  demoScenario,
  type ScenarioView,
  type Segment,
} from '@/features/scenario/demoScenario';
import SkyPanel from '@/features/scenario/SkyPanel/SkyPanel';
import VerdictCard from '@/features/scenario/VerdictCard/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline/ViabilityTimeline';
import {
  durationDays,
  getSiteName,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

/** Обрезает отрезки по длительности миссии. */
const clipSegments = (segments: Segment[], limit: number): Segment[] =>
  segments
    .filter(([start]) => start < limit)
    .map(([start, end]): Segment => [start, Math.min(end, limit)]);

export default function ScenarioPage() {
  const { t } = useTranslation();
  const siteName = useScenarioStore((state) => getSiteName(state));
  const epoch = useScenarioStore((state) => state.epoch);
  const duration = useScenarioStore((state) => state.duration);

  // TODO: заменить демо-цифры расчётом по выбранной площадке и дате
  const days = durationDays[duration];
  const scenario: ScenarioView = {
    ...demoScenario,
    siteName,
    epoch,
    durationDays: days,
    sunSegments: clipSegments(demoScenario.sunSegments, days),
    earthSegments: clipSegments(demoScenario.earthSegments, days),
    windowSegments: clipSegments(demoScenario.windowSegments, days),
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-slate-500">{t('scenario.demoNote')}</p>

      <VerdictCard scenario={scenario}>
        <CountdownChips sunset={scenario.sunset} earthset={scenario.earthset} />
      </VerdictCard>

      <ViabilityTimeline
        durationDays={scenario.durationDays}
        sunSegments={scenario.sunSegments}
        earthSegments={scenario.earthSegments}
        windowSegments={scenario.windowSegments}
      />

      <SkyPanel
        sun={scenario.sun}
        earth={scenario.earth}
        sunTrack={scenario.sunTrack}
        earthTrack={scenario.earthTrack}
        horizon={scenario.horizon}
      />
    </div>
  );
}
