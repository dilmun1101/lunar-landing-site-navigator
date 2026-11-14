import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { SkyPoint } from '@/features/scenario/demoScenario';

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 145;
const RING_ELEVATIONS = [0, 2, 4, 6];

interface PolarSkyChartProps {
  sun: SkyPoint;
  earth: SkyPoint;
  sunTrack: SkyPoint[];
  earthTrack: SkyPoint[];
  /** Высота рельефа по азимуту, равномерно на 360° */
  horizon: number[];
  /** Высота в центре диаграммы, градусы (масштаб «увеличен» у горизонта) */
  maxElevation?: number;
  className?: string;
}

export default function PolarSkyChart({
  sun,
  earth,
  sunTrack,
  earthTrack,
  horizon,
  maxElevation = 8,
  className,
}: PolarSkyChartProps) {
  const { t } = useTranslation();

  const toXY = (azimuth: number, elevation: number) => {
    const radius =
      RADIUS * (1 - Math.min(elevation, maxElevation) / maxElevation);
    const angle = (azimuth * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.sin(angle),
      y: CENTER - radius * Math.cos(angle),
    };
  };
  const toPoints = (track: SkyPoint[]) =>
    track
      .map((point) => {
        const { x, y } = toXY(point.azimuth, point.elevation);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const outerCircle =
    `M ${CENTER - RADIUS} ${CENTER} ` +
    `a ${RADIUS} ${RADIUS} 0 1 0 ${2 * RADIUS} 0 ` +
    `a ${RADIUS} ${RADIUS} 0 1 0 ${-2 * RADIUS} 0 Z`;
  const terrainEdge =
    horizon
      .map((elevation, index) => {
        const { x, y } = toXY((index * 360) / horizon.length, elevation);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  const sunXY = toXY(sun.azimuth, sun.elevation);
  const earthXY = toXY(earth.azimuth, earth.elevation);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={t('scenario.polar.title')}
      className={classNames('w-full', className)}
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        className="fill-white/[0.02] stroke-white/20"
      />

      {RING_ELEVATIONS.slice(1).map((elevation) => {
        const radius = RADIUS * (1 - elevation / maxElevation);
        return (
          <g key={elevation}>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={radius}
              className="fill-none stroke-white/10"
            />
            <text
              x={CENTER + 4}
              y={CENTER - radius + 12}
              className="fill-slate-500 font-mono text-[10px]"
            >
              {elevation}°
            </text>
          </g>
        );
      })}

      <line
        x1={CENTER}
        y1={CENTER - RADIUS}
        x2={CENTER}
        y2={CENTER + RADIUS}
        className="stroke-white/10"
      />
      <line
        x1={CENTER - RADIUS}
        y1={CENTER}
        x2={CENTER + RADIUS}
        y2={CENTER}
        className="stroke-white/10"
      />

      <path
        d={`${outerCircle} ${terrainEdge}`}
        fillRule="evenodd"
        className="fill-slate-500/50"
      />

      <polyline
        points={toPoints(sunTrack)}
        className="fill-none stroke-sun/70"
        strokeWidth={2}
        strokeDasharray="4 4"
      />
      <polyline
        points={toPoints(earthTrack)}
        className="fill-none stroke-earth/70"
        strokeWidth={2}
        strokeDasharray="4 4"
      />

      <circle cx={sunXY.x} cy={sunXY.y} r={14} className="fill-sun/25" />
      <circle cx={sunXY.x} cy={sunXY.y} r={6} className="fill-sun" />
      <circle cx={earthXY.x} cy={earthXY.y} r={14} className="fill-earth/25" />
      <circle cx={earthXY.x} cy={earthXY.y} r={6} className="fill-earth" />

      <g className="fill-slate-300 text-xs font-semibold">
        <text x={CENTER} y={CENTER - RADIUS - 10} textAnchor="middle">
          {t('scenario.polar.north')}
        </text>
        <text x={CENTER} y={CENTER + RADIUS + 20} textAnchor="middle">
          {t('scenario.polar.south')}
        </text>
        <text x={CENTER + RADIUS + 10} y={CENTER + 4} textAnchor="start">
          {t('scenario.polar.east')}
        </text>
        <text x={CENTER - RADIUS - 10} y={CENTER + 4} textAnchor="end">
          {t('scenario.polar.west')}
        </text>
      </g>
    </svg>
  );
}
