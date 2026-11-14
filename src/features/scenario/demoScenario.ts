import type { Duration, Verdict } from '@/types';

// DEMO DATA: static display values. Calculations are not connected yet.

export type Segment = [startDay: number, endDay: number];

export interface SkyPoint {
  /** Azimuth, degrees clockwise from north */
  azimuth: number;
  /** Elevation above the horizon, degrees */
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
  /** The longest period without the Sun */
  longestDarkness: Duration;
  /** The longest period without a direct link to the Earth */
  longestCommsGap: Duration;
  /** The darkness is longer than the battery limit from the criteria */
  blackoutExceeded: boolean;
  /** null — the body is currently below the horizon */
  sunset: Duration | null;
  earthset: Duration | null;
  sun: SkyPoint;
  earth: SkyPoint;
  sunSegments: Segment[];
  earthSegments: Segment[];
  windowSegments: Segment[];
  sunTrack: SkyPoint[];
  earthTrack: SkyPoint[];
  /** Terrain height on the horizon every 5° of azimuth (72 values) */
  horizon: number[];
}

// Synthetic terrain around the site
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

/** Path of a body until it sets: elevation falls linearly to zero, azimuth shifts. */
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
  longestDarkness: { days: 3, hours: 0 },
  longestCommsGap: { days: 4, hours: 12 },
  blackoutExceeded: false,
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
