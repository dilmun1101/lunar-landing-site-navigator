import { useTranslation } from 'react-i18next';
import CountdownChips from '@/features/scenario/CountdownChips/CountdownChips';
import { demoScenario } from '@/features/scenario/demoScenario';
import SkyPanel from '@/features/scenario/SkyPanel/SkyPanel';
import VerdictCard from '@/features/scenario/VerdictCard/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline/ViabilityTimeline';

export default function ScenarioPage() {
  const { t } = useTranslation();
  // TODO: заменить демо-данные расчётом по выбранной площадке и дате
  const scenario = demoScenario;

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
