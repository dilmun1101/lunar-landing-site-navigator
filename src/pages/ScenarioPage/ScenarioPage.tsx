import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import { maskEphemeris } from '@/domain/criteria/missionSegments';
import { skySnapshot } from '@/domain/ephemeris/skySnapshot/skySnapshot';
import {
  highestElevationBetween,
  panoramaMaxElevation,
} from '@/domain/horizon/panorama/panorama';
import { buildScenarioView } from '@/features/scenario/buildScenarioView';
import CountdownChips from '@/features/scenario/CountdownChips/CountdownChips';
import {
  demoScenario,
  type ScenarioView,
  type Segment,
} from '@/features/scenario/demoScenario';
import ExternalMapLinks from '@/features/scenario/ExternalMapLinks/ExternalMapLinks';
import HorizonPanorama from '@/features/scenario/HorizonPanorama/HorizonPanorama';
import PlaybackControls from '@/features/scenario/PlaybackControls/PlaybackControls';
import SkyPanel from '@/features/scenario/SkyPanel/SkyPanel';
import { useHorizonProfile } from '@/features/scenario/useHorizonProfile/useHorizonProfile';
import { usePlayback } from '@/features/scenario/usePlayback/usePlayback';
import { useSiteEphemeris } from '@/features/scenario/useSiteEphemeris/useSiteEphemeris';
import SourcesPanel from '@/features/scenario/SourcesPanel/SourcesPanel';
import VerdictCard from '@/features/scenario/VerdictCard/VerdictCard';
import ViabilityTimeline from '@/features/scenario/ViabilityTimeline/ViabilityTimeline';
import { useCriteriaStore } from '@/state/useCriteriaStore/useCriteriaStore';
import {
  durationDays,
  getSiteName,
  resolveCoordinates,
  useScenarioStore,
} from '@/state/useScenarioStore/useScenarioStore';

const DAY_MS = 86_400_000;
const FLAT_HORIZON = Array.from({ length: 72 }, () => 0);

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
  const criteria = useCriteriaStore((state) => state.criteria);

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
          criteria,
        })
      : null;

  // The sky at the current moment of the playback; the verdict stays for the whole mission
  const ephemeris = data.status === 'ready' ? data.ephemeris : null;
  const profile = terrain.status === 'ready' ? terrain.profile : null;
  const terrainLoading = terrain.status === 'loading';
  const visible = useMemo(
    () =>
      ephemeris && !terrainLoading ? maskEphemeris(ephemeris, profile) : null,
    [ephemeris, profile, terrainLoading]
  );
  const missionMs = days * DAY_MS;
  const playback = usePlayback(
    real ? missionMs : 0,
    `${coordinates?.lat}|${coordinates?.lon}|${epoch.getTime()}|${days}`
  );
  const startMs = epoch.getTime();
  const sky =
    real && ephemeris && visible
      ? skySnapshot(
          ephemeris,
          visible,
          profile ?? FLAT_HORIZON,
          startMs + playback.offsetMs,
          startMs + missionMs
        )
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

  const shown: ScenarioView = sky ? { ...scenario, ...sky } : scenario;

  // The vertical scale of the panorama is fixed for the whole mission, so it does not jump
  const highestBody = useMemo(
    () =>
      ephemeris
        ? highestElevationBetween(ephemeris, startMs, startMs + missionMs)
        : Math.max(demoScenario.sun.elevation, demoScenario.earth.elevation, 0),
    [ephemeris, startMs, missionMs]
  );
  const panoramaScale = panoramaMaxElevation(scenario.horizon, highestBody);

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

  // The same controls sit under the timeline and above the full-size sky view
  const playbackControls = (
    <PlaybackControls
      playback={playback}
      epoch={epoch}
      durationMs={missionMs}
      disabled={!real}
    />
  );

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
        <CountdownChips sunset={shown.sunset} earthset={shown.earthset} />
      </VerdictCard>

      <ViabilityTimeline
        durationDays={scenario.durationDays}
        sunSegments={scenario.sunSegments}
        earthSegments={scenario.earthSegments}
        windowSegments={scenario.windowSegments}
        nowDay={playback.offsetMs / DAY_MS}
        onSeek={real ? (day) => playback.seek(day * DAY_MS) : undefined}
      />

      {playbackControls}

      <SkyPanel
        sun={shown.sun}
        earth={shown.earth}
        sunTrack={shown.sunTrack}
        earthTrack={shown.earthTrack}
        horizon={scenario.horizon}
        expandedHeader={playbackControls}
        site={
          coordinates
            ? { lat: coordinates.lat, lon: coordinates.lon }
            : undefined
        }
        footer={
          coordinates ? (
            <ExternalMapLinks coordinates={coordinates} />
          ) : undefined
        }
      />

      <HorizonPanorama
        sun={shown.sun}
        earth={shown.earth}
        horizon={scenario.horizon}
        maxElevation={panoramaScale}
        hasTerrain={!real || terrain.status === 'ready'}
      />

      <SourcesPanel
        criteria={criteria}
        hasTerrain={terrain.status === 'ready'}
      />
    </div>
  );
}
