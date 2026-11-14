import type { Duration, Verdict } from '@/types';

// ДЕМО-ДАННЫЕ: статичные значения для отображения. Расчёты пока не подключены.

export type Segment = [startDay: number, endDay: number];

export interface SkyPoint {
  /** Азимут, градусы от севера по часовой стрелке */
  azimuth: number;
  /** Высота над горизонтом, градусы */
  elevation: number;
}

export interface ScenarioView {
  id: string;
  siteName: string;
  epoch: Date;
  durationDays: number;
  verdict: Verdict;
  sunlightPercent: number;
  earthLinkPercent: number;
  windowPercent: number;
  sunlightDuration: Duration;
  earthWindowDuration: Duration;
  sunset: Duration;
  earthset: Duration;
  sun: SkyPoint;
  earth: SkyPoint;
  sunSegments: Segment[];
  earthSegments: Segment[];
  windowSegments: Segment[];
  sunTrack: SkyPoint[];
  earthTrack: SkyPoint[];
  /** Высота рельефа на горизонте через каждые 5° азимута (72 значения) */
  horizon: number[];
}

// Условный рельеф вокруг площадки
const horizon = Array.from({ length: 72 }, (_, index) => {
  const a = (index * 5 * Math.PI) / 180;
  const value =
    0.9 +
    0.7 * Math.sin(2 * a + 0.6) +
    0.5 * Math.sin(5 * a) +
    0.3 * Math.sin(11 * a);
  return Math.round(Math.min(3.5, Math.max(0.2, value)) * 10) / 10;
});

const terrainAt = (azimuth: number) =>
  horizon[Math.round((((azimuth % 360) + 360) % 360) / 5) % 72] ?? 0;

/** Путь светила до захода: высота линейно падает до нуля, азимут сдвигается. */
function buildTrack(
  startAzimuth: number,
  azimuthPerDay: number,
  startElevation: number,
  daysUntilSet: number
): SkyPoint[] {
  const steps = 12;
  const points: SkyPoint[] = [];
  for (let step = 0; step <= steps; step++) {
    const day = (daysUntilSet * step) / steps;
    const point = {
      azimuth: (startAzimuth + azimuthPerDay * day) % 360,
      elevation: startElevation * (1 - day / daysUntilSet),
    };
    if (point.elevation <= terrainAt(point.azimuth)) break;
    points.push(point);
  }
  return points;
}

export const demoScenario: ScenarioView = {
  id: 'malapert-massif',
  siteName: 'Malapert Massif',
  epoch: new Date(Date.UTC(2026, 10, 14, 12, 0)),
  durationDays: 29.5,
  verdict: 'viable',
  sunlightPercent: 78,
  earthLinkPercent: 61,
  windowPercent: 51,
  sunlightDuration: { days: 23, hours: 0 },
  earthWindowDuration: { days: 18, hours: 0 },
  sunset: { days: 4, hours: 11 },
  earthset: { days: 2, hours: 3 },
  sun: { azimuth: 120, elevation: 2.4 },
  earth: { azimuth: 8, elevation: 3.2 },
  sunSegments: [
    [0, 4.5],
    [8, 23],
    [26, 29.5],
  ],
  earthSegments: [
    [0, 2.1],
    [7, 19.9],
    [24, 27],
  ],
  windowSegments: [
    [0, 2.1],
    [8, 19.9],
    [26, 27],
  ],
  sunTrack: buildTrack(120, 12.2, 2.4, 4.46),
  earthTrack: buildTrack(8, 6, 3.2, 2.125),
  horizon,
};

export const demoComparison: ScenarioView[] = [
  demoScenario,
  {
    ...demoScenario,
    id: 'nobile-rim-1',
    siteName: 'Nobile Rim 1',
    verdict: 'marginal',
    sunlightPercent: 64,
    earthLinkPercent: 72,
    windowPercent: 41,
    sunlightDuration: { days: 19, hours: 0 },
    earthWindowDuration: { days: 21, hours: 0 },
    sun: { azimuth: 95, elevation: 1.1 },
    windowSegments: [
      [1, 5],
      [9, 17],
      [20, 23],
    ],
  },
];

export const demoBestAlternative = { days: 3, percent: 14 };
