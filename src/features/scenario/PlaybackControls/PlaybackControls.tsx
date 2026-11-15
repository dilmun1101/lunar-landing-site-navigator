import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import SegmentedControl from '@/components/ui/SegmentedControl/SegmentedControl';
import { PLAYBACK_SPEEDS } from '@/domain/playback/playback';
import type { Playback } from '@/features/scenario/usePlayback/usePlayback';
import { useMode } from '@/hooks/useMode/useMode';
import { formatUtcDateTime } from '@/lib/format/format';

const HOUR_MS = 3_600_000;

/** Labels of the speeds, in the order of PLAYBACK_SPEEDS */
const expertSpeedKeys = ['hour', 'sixHours', 'day'] as const;
const beginnerSpeedKeys = ['slow', 'fast', 'veryFast'] as const;

interface PlaybackControlsProps {
  playback: Playback;
  /** Start of the mission */
  epoch: Date;
  durationMs: number;
  /** There is no data to play yet */
  disabled?: boolean;
  className?: string;
}

export default function PlaybackControls({
  playback,
  epoch,
  durationMs,
  disabled = false,
  className,
}: PlaybackControlsProps) {
  const { t, i18n } = useTranslation();
  const beginner = useMode() === 'beginner';

  const moment = new Date(epoch.getTime() + playback.offsetMs);
  // A beginner gets a calendar date; an expert gets the exact UTC time
  const readout = beginner
    ? new Intl.DateTimeFormat(i18n.language, {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(moment)
    : `${formatUtcDateTime(moment, i18n.language)} UTC`;

  const speedKeys = beginner ? beginnerSpeedKeys : expertSpeedKeys;

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle>{t('scenario.playback.title')}</SectionTitle>
        <span
          className="font-mono text-sm text-slate-100"
          aria-live="off"
          data-testid="playback-readout"
        >
          {readout}
        </span>
      </div>

      <div
        className={classNames('flex flex-wrap items-center gap-3', {
          'pointer-events-none opacity-40': disabled,
        })}
      >
        <Button
          variant="primary"
          className="min-w-24"
          disabled={disabled}
          onClick={playback.toggle}
        >
          {playback.playing
            ? t('scenario.timeline.pause')
            : t('scenario.timeline.play')}
        </Button>
        <Button
          disabled={disabled}
          onClick={playback.reset}
          aria-label={t('scenario.playback.toStart')}
        >
          ⏮
        </Button>

        <input
          type="range"
          min={0}
          max={Math.max(durationMs, HOUR_MS)}
          step={HOUR_MS}
          value={playback.offsetMs}
          disabled={disabled}
          onChange={(event) => playback.seek(Number(event.target.value))}
          aria-label={t('scenario.playback.position')}
          aria-valuetext={readout}
          className="min-w-40 flex-1 accent-accent"
        />

        <SegmentedControl
          label={t('scenario.timeline.speed')}
          value={String(playback.speed)}
          onChange={(value) => playback.setSpeed(Number(value))}
          options={PLAYBACK_SPEEDS.map((speed, index) => ({
            value: String(speed),
            label: t(`scenario.playback.speeds.${speedKeys[index] ?? 'slow'}`),
          }))}
        />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={playback.loop}
            disabled={disabled}
            onChange={(event) => playback.setLoop(event.target.checked)}
            className="accent-accent"
          />
          {t('scenario.playback.loop')}
        </label>
      </div>
    </Panel>
  );
}
