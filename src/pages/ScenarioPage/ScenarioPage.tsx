import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import CountdownChips from '@/features/scenario/CountdownChips/CountdownChips';
import {
  demoScenario,
  type ScenarioView,
  type Segment,
} from '@/features/scenario/demoScenario';
import SkyPanel from '@/features/scenario/SkyPanel/SkyPanel';
import { useHorizonProfile } from '@/features/scenario/useHorizonProfile/useHorizonProfile';
import { useSiteEphemeris } from '@/features/scenario/useSiteEphemeris/useSiteEphemeris';
import VerdictCard from '@/features/scenario/VerdictCard/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline/ViabilityTimeline';
import {
  durationDays,
  getSiteName,
  resolveCoordinates,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

/** Clips demo segments to the mission duration. */
const clipSegments = (segments: Segment[], limit: number): Segment[] =>
  segments
    .filter(([start]) => start < limit)
    .map(([start, end]): Segment => [start, Math.min(end, limit)]);

export default function ScenarioPage() {
  const { t } = useTranslation();
  const siteId = useScenarioStore((state) => state.siteId);
  const customSite = useScenarioStore((state) => state.customSite);
  const siteName = useScenarioStore((state) => getSiteName(state));
  const epoch = useScenarioStore((state) => state.epoch);
  const duration = useScenarioStore((state) => state.duration);

  const days = durationDays[duration];
  const coordinates = resolveCoordinates(siteId, customSite);
  const data = useSiteEphemeris(coordinates, epoch, days);
  const terrain = useHorizonProfile(coordinates);

  const real =
    data.status === 'ready' && terrain.status !== 'loading'
      ? buildScenarioView({
          id: siteId ?? 'custom',
          siteName,
          epoch,
          durationDays: days,
          ephemeris: data.ephemeris,
          horizon: terrain.status === 'ready' ? terrain.profile : null,
        })
      : null;

  // While there is no data, show demo values and explain why
  const scenario: ScenarioView = real ?? {
    ...demoScenario,
    siteName,
    epoch,
    durationDays: days,
    sunSegments: clipSegments(demoScenario.sunSegments, days),
    earthSegments: clipSegments(demoScenario.earthSegments, days),
    windowSegments: clipSegments(demoScenario.windowSegments, days),
  };

  let note: string;
  if (real) {
    note = t(
      `scenario.dataNote${terrain.status === 'ready' ? '' : 'Flat'}${
        coordinates?.approximate ? 'Approx' : ''
      }`
    );
  } else if (data.status === 'loading' || data.status === 'ready') {
    note = t('scenario.loading');
  } else if (data.status === 'idle') {
    note = t('scenario.noData');
  } else {
    note = t('scenario.fetchError');
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{note}</p>
        {data.status !== 'idle' && data.status !== 'loading' && (
          <Button
            className="shrink-0 px-2 py-1 text-xs"
            onClick={() => {
              data.reload();
              terrain.reload();
            }}
          >
            {t('common.refresh')}
          </Button>
        )}
      </div>

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
