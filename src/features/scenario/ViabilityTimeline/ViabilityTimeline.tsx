import classNames from 'classnames';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import TitleWithHint from '@/components/ui/TitleWithHint/TitleWithHint';
import type { Segment } from '@/features/scenario/demoScenario';
import Playhead from '@/features/scenario/Playhead/Playhead';

interface ViabilityTimelineProps {
  durationDays: number;
  sunSegments: Segment[];
  earthSegments: Segment[];
  windowSegments: Segment[];
  /** Current moment on the scale, in days from the start */
  nowDay?: number;
  /** Click or drag on the scale moves the current moment (days from the start) */
  onSeek?: (day: number) => void;
  className?: string;
}

export default function ViabilityTimeline({
  durationDays,
  sunSegments,
  earthSegments,
  windowSegments,
  nowDay = 0,
  onSeek,
  className,
}: ViabilityTimelineProps) {
  const { t } = useTranslation();
  const scaleRef = useRef<HTMLDivElement>(null);

  const seekFromPointer = (clientX: number) => {
    const box = scaleRef.current?.getBoundingClientRect();
    if (!onSeek || !box || box.width === 0) return;
    const fraction = Math.min(Math.max((clientX - box.left) / box.width, 0), 1);
    onSeek(fraction * durationDays);
  };

  const percent = (day: number) => (day / durationDays) * 100;
  const ticks = Array.from(
    { length: Math.floor(durationDays / 5) + 1 },
    (_, index) => index * 5
  );

  const rows = [
    {
      key: 'sun',
      label: t('scenario.timeline.sunAbove'),
      segments: sunSegments,
      color: 'bg-sun',
    },
    {
      key: 'earth',
      label: t('scenario.timeline.earthAbove'),
      segments: earthSegments,
      color: 'bg-earth',
    },
    {
      key: 'window',
      label: t('scenario.timeline.window'),
      segments: windowSegments,
      color: 'bg-emerald-400',
    },
  ];

  return (
    <Panel className={classNames('flex flex-col gap-6', className)}>
      <TitleWithHint hint={t('help.timeline')}>
        {t('scenario.timeline.title')}
      </TitleWithHint>

      <div className="grid grid-cols-[minmax(7rem,11rem)_1fr] gap-x-3">
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <span
              key={row.key}
              className="flex h-5 items-center text-sm text-slate-300"
            >
              {row.label}
            </span>
          ))}
        </div>

        <div className="flex flex-col">
          <div ref={scaleRef} className="relative flex flex-col gap-3">
            {rows.map((row) => (
              <div
                key={row.key}
                className="relative h-5 rounded bg-white/5"
                role="img"
                aria-label={row.label}
              >
                {row.segments.map(([start, end]) => (
                  <div
                    key={`${start}-${end}`}
                    className={classNames(
                      'absolute inset-y-0 rounded-sm opacity-90',
                      row.color
                    )}
                    style={{
                      left: `${percent(start)}%`,
                      width: `${percent(end) - percent(start)}%`,
                    }}
                  />
                ))}
              </div>
            ))}
            <Playhead leftPercent={percent(nowDay)} />
            {onSeek && (
              // Pointer shortcut; the slider in the playback panel is the accessible control
              <div
                aria-hidden="true"
                className="absolute inset-0 z-20 cursor-pointer touch-none"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  seekFromPointer(event.clientX);
                }}
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    seekFromPointer(event.clientX);
                  }
                }}
              />
            )}
          </div>

          <div className="relative mt-2 h-4">
            {ticks.map((tick) => (
              <span
                key={tick}
                className="absolute -translate-x-1/2 font-mono text-[11px] text-slate-500"
                style={{ left: `${percent(tick)}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-slate-500">
            {t('scenario.timeline.axis')}
          </p>
        </div>
      </div>
    </Panel>
  );
}
