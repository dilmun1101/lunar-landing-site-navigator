import { describe, expect, it } from 'vitest';
import { positionAt } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import { parseObserverTable } from '@/lib/horizons/parseObserverTable/parseObserverTable';

// Validation against an independent source: the table "Sun and Earth: Altitudes and Azimuths at
// the Apollo Landing Sites" from the Apollo Lunar Surface Journal (computed by P. Fjeld and
// J. Scotti, NASA). The `rows` are real JPL Horizons responses (airless, hourly, the landing
// coordinates from that table) saved as they were received.
// The Earth altitude of Apollo 11 is not checked: the table prints it ambiguously ("59:43").

interface Landing {
  name: string;
  landingUtc: string;
  sun: { rows: string[]; altitude: number; azimuth: number };
  earth: { rows: string[]; altitude: number | null; azimuth: number };
}

const landings: Landing[] = [
  {
    name: 'Apollo 11',
    landingUtc: '1969-07-20T20:17:39Z',
    sun: {
      rows: [
        '1969-Jul-20 20:00,*,i,  88.806247,    10.513763,',
        '1969-Jul-20 21:00,*,i,  88.811134,    11.023191,',
      ],
      altitude: 10.65,
      azimuth: 88.81,
    },
    earth: {
      rows: [
        '1969-Jul-20 20:00,*,i, 272.140561,    59.271120,',
        '1969-Jul-20 21:00,*,i, 272.256794,    59.249508,',
      ],
      altitude: null,
      azimuth: 272.16,
    },
  },
  {
    name: 'Apollo 12',
    landingUtc: '1969-11-19T06:54:36Z',
    sun: {
      rows: [
        '1969-Nov-19 06:00,*,i,  91.187396,     4.728440,',
        '1969-Nov-19 07:00,*,i,  91.160904,     5.233865,',
      ],
      altitude: 5.19,
      azimuth: 91.16,
    },
    earth: {
      rows: [
        '1969-Nov-19 06:00,*,i,  86.837781,    61.427417,',
        '1969-Nov-19 07:00,*,i,  86.972393,    61.421920,',
      ],
      altitude: 61.56,
      azimuth: 86.95,
    },
  },
  {
    name: 'Apollo 14',
    landingUtc: '1971-02-05T09:18:13Z',
    sun: {
      rows: [
        '1971-Feb-05 09:00,*,i,  89.560497,    10.201888,',
        '1971-Feb-05 10:00,*,i,  89.526054,    10.706905,',
      ],
      altitude: 10.36,
      azimuth: 89.54,
    },
    earth: {
      rows: [
        '1971-Feb-05 09:00,*,i,  96.829422,    65.956628,',
        '1971-Feb-05 10:00,*,i,  96.762465,    65.971403,',
      ],
      altitude: 66.1,
      azimuth: 96.7,
    },
  },
  {
    name: 'Apollo 15',
    landingUtc: '1971-07-30T22:16:29Z',
    sun: {
      rows: [
        '1971-Jul-30 22:00,*,i,  95.657284,    11.919864,',
        '1971-Jul-30 23:00,*,i,  95.891913,    12.374283,',
      ],
      altitude: 12.05,
      azimuth: 95.73,
    },
    earth: {
      rows: [
        '1971-Jul-30 22:00,*,i, 202.970175,    69.205465,',
        '1971-Jul-30 23:00,*,i, 203.081905,    69.192986,',
      ],
      altitude: 69.28,
      azimuth: 203,
    },
  },
  {
    name: 'Apollo 16',
    landingUtc: '1972-04-21T02:23:35Z',
    sun: {
      rows: [
        '1972-Apr-21 02:00,*,i,  86.031787,    14.575791,',
        '1972-Apr-21 03:00,*,i,  85.942609,    15.076522,',
      ],
      altitude: 14.76,
      azimuth: 86.01,
    },
    earth: {
      rows: [
        '1972-Apr-21 02:00,*,i, 319.633495,    77.127080,',
        '1972-Apr-21 03:00,*,i, 319.762630,    77.070990,',
      ],
      altitude: 77.16,
      azimuth: 319.7,
    },
  },
  {
    name: 'Apollo 17',
    landingUtc: '1972-12-11T19:54:58Z',
    sun: {
      rows: [
        '1972-Dec-11 19:00,*,i,  95.675457,    12.912421,',
        '1972-Dec-11 20:00,*,i,  95.860404,    13.386443,',
      ],
      altitude: 13.33,
      azimuth: 95.83,
    },
    earth: {
      rows: [
        '1972-Dec-11 19:00,*,i, 240.932685,    45.339186,',
        '1972-Dec-11 20:00,*,i, 240.890841,    45.295372,',
      ],
      altitude: 45.52,
      azimuth: 240.88,
    },
  },
];

/** Position at the landing time, read the same way the app reads a Horizons response. */
function positionAtLanding(rows: string[], landingUtc: string) {
  const table = parseObserverTable(`$$SOE\n${rows.join('\n')}\n$$EOE`);
  const timeline = {
    startMs: table.times[0] ?? 0,
    stepMs: 3_600_000,
  };
  const position = positionAt(
    { az: table.az, el: table.el },
    timeline,
    Date.parse(landingUtc)
  );
  if (!position) throw new Error('the landing time is outside the table');
  return position;
}

describe('Horizons pipeline against the Apollo Lunar Surface Journal', () => {
  for (const landing of landings) {
    it(`${landing.name}: the Sun at landing`, () => {
      const position = positionAtLanding(landing.sun.rows, landing.landingUtc);
      expect(Math.abs(position.elevation - landing.sun.altitude)).toBeLessThan(
        0.1
      );
      expect(Math.abs(position.azimuth - landing.sun.azimuth)).toBeLessThan(
        0.1
      );
    });

    it(`${landing.name}: the Earth at landing`, () => {
      const position = positionAtLanding(
        landing.earth.rows,
        landing.landingUtc
      );
      // The sources use slightly different libration models: 0.3° is far below the sky resolution that matters
      if (landing.earth.altitude !== null) {
        expect(
          Math.abs(position.elevation - landing.earth.altitude)
        ).toBeLessThan(0.3);
      }
      expect(Math.abs(position.azimuth - landing.earth.azimuth)).toBeLessThan(
        0.3
      );
    });
  }
});
