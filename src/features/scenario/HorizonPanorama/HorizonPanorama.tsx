import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import Panel from '@/components/ui/Panel/Panel';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import {
  azimuthTicks,
  elevationTicks,
  placeBody,
  terrainPath,
  type BodyState,
} from '@/domain/horizon/panorama/panorama';
import type { SkyPoint } from '@/features/scenario/demoScenario';
import { useMode } from '@/hooks/useMode/useMode';

/** Drawing units of the strip; the SVG scales to the width of the panel */
const WIDTH = 720;
const HEIGHT = 140;
const LABELS_HEIGHT = 30;
const BODY_RADIUS = 6;

const CARDINALS = [
  { azimuth: 0, key: 'north' },
  { azimuth: 90, key: 'east' },
  { azimuth: 180, key: 'south' },
  { azimuth: 270, key: 'west' },
] as const;

interface HorizonPanoramaProps {
  sun: SkyPoint;
  earth: SkyPoint;
  /** Terrain horizon: 72 elevations, every 5° of azimuth from north */
  horizon: number[];
  /** Top of the vertical scale, degrees (see `panoramaMaxElevation`) */
  maxElevation: number;
  /** false — no LOLA data, the horizon is flat */
  hasTerrain?: boolean;
  className?: string;
}

const bodyStyle = {
  sun: { fill: 'fill-sun', glow: 'fill-sun/25', stroke: 'stroke-sun' },
  earth: { fill: 'fill-earth', glow: 'fill-earth/25', stroke: 'stroke-earth' },
} as const;

export default function HorizonPanorama({
  sun,
  earth,
  horizon,
  maxElevation,
  hasTerrain = true,
  className,
}: HorizonPanoramaProps) {
  const { t, i18n } = useTranslation();
  const expert = useMode() === 'expert';
  const size = { width: WIDTH, height: HEIGHT };

  const bodies = [
    { key: 'sun', point: sun },
    { key: 'earth', point: earth },
  ] as const;
  const placed = bodies.map((body) => ({
    ...body,
    ...placeBody(body.point, horizon, size, maxElevation),
  }));

  const elevationStep = maxElevation > 30 ? 10 : 5;
  const gridElevations = expert
    ? elevationTicks(elevationStep, HEIGHT, maxElevation)
    : [];
  const gridAzimuths = expert ? azimuthTicks(30, WIDTH) : [];

  const degrees = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 0,
  });
  const signedDegrees = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always',
  });

  const stateText = (state: BodyState) => t(`scenario.panorama.state.${state}`);
  const describe = (item: (typeof placed)[number]) => {
    const base = `${t(`scenario.legend.${item.key}`)}: ${stateText(item.state)}`;
    return expert
      ? `${base} (${t('scenario.sky.azimuth')} ${degrees.format(item.point.azimuth)}°, ${t('scenario.sky.elevation')} ${signedDegrees.format(item.point.elevation)}°)`
      : base;
  };

  return (
    <Panel className={classNames('flex flex-col gap-3', className)}>
      <SectionTitle>{t('scenario.panorama.title')}</SectionTitle>

      {/* On a narrow screen the strip scrolls sideways instead of shrinking the text */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT + LABELS_HEIGHT}`}
          className="w-full min-w-[40rem] overflow-hidden"
          role="img"
          aria-label={`${t('scenario.panorama.title')}. ${placed.map(describe).join('. ')}`}
        >
          <rect
            width={WIDTH}
            height={HEIGHT}
            className="fill-white/[0.02] stroke-white/20"
          />

          {gridAzimuths.map((tick) => (
            <line
              key={`az-${tick.value}`}
              x1={tick.position}
              x2={tick.position}
              y1={0}
              y2={HEIGHT}
              className="stroke-white/10"
            />
          ))}
          {gridElevations.map((tick) => (
            <g key={`el-${tick.value}`}>
              <line
                x1={0}
                x2={WIDTH}
                y1={tick.position}
                y2={tick.position}
                className="stroke-white/10"
              />
              {tick.value > 0 && (
                <text
                  x={4}
                  y={tick.position - 3}
                  className="fill-slate-500 font-mono text-[10px]"
                >
                  {tick.value}°
                </text>
              )}
            </g>
          ))}

          <path
            d={terrainPath(horizon, size, maxElevation)}
            className={classNames('stroke-slate-400/70', {
              'fill-slate-500/50': hasTerrain,
              'fill-slate-500/20': !hasTerrain,
            })}
            strokeWidth={1}
          />

          {placed.map((item) => {
            if (item.state === 'belowHorizon') return null;
            const hidden = item.state === 'behindTerrain';
            const style = bodyStyle[item.key];
            // Near the edge the disc continues on the other side of the strip
            const xs = [item.x];
            if (item.x < BODY_RADIUS * 2) xs.push(item.x + WIDTH);
            if (item.x > WIDTH - BODY_RADIUS * 2) xs.push(item.x - WIDTH);
            return (
              <g key={item.key} opacity={hidden ? 0.45 : 1}>
                {xs.map((x) => (
                  <g key={x}>
                    {!hidden && (
                      <circle
                        cx={x}
                        cy={item.y}
                        r={BODY_RADIUS * 2.3}
                        className={style.glow}
                      />
                    )}
                    <circle
                      cx={x}
                      cy={item.y}
                      r={BODY_RADIUS}
                      className={
                        hidden ? `fill-none ${style.stroke}` : style.fill
                      }
                      strokeWidth={hidden ? 1.5 : 0}
                      strokeDasharray={hidden ? '3 2' : undefined}
                    />
                  </g>
                ))}
              </g>
            );
          })}

          <g className="fill-slate-300 text-xs font-semibold">
            {CARDINALS.map(({ azimuth, key }) => {
              const x = azimuthTicks(90, WIDTH).find(
                (tick) => tick.value === azimuth
              )?.position;
              return (
                <text
                  key={key}
                  x={x}
                  y={HEIGHT + 18}
                  textAnchor={azimuth === 0 ? 'start' : 'middle'}
                >
                  {t(`scenario.panorama.cardinal.${key}`)}
                </text>
              );
            })}
            <text x={WIDTH} y={HEIGHT + 18} textAnchor="end">
              {t('scenario.panorama.cardinal.north')}
            </text>
          </g>
          {expert && (
            <g className="fill-slate-500 font-mono text-[10px]">
              {gridAzimuths
                .filter((tick) => tick.value % 90 !== 0)
                .map((tick) => (
                  <text
                    key={tick.value}
                    x={tick.position}
                    y={HEIGHT + 18}
                    textAnchor="middle"
                  >
                    {tick.value}°
                  </text>
                ))}
            </g>
          )}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-200">
        {placed.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span
              className={classNames('size-2.5 rounded-full', {
                'bg-sun': item.key === 'sun',
                'bg-earth': item.key === 'earth',
              })}
            />
            <span className={expert ? 'font-mono text-xs' : undefined}>
              {describe(item)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">
        {hasTerrain ? t('scenario.panorama.hint') : t('scenario.panorama.flat')}
      </p>
    </Panel>
  );
}
