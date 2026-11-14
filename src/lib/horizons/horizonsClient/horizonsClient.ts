import { parseObserverTable } from '@/lib/horizons/parseObserverTable/parseObserverTable';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

// Horizons does not allow requests from other sites (CORS), so we call it
// through a same-origin proxy: see server.proxy / preview.proxy in vite.config.ts.
// The proxy rewrites /horizons-api → https://ssd.jpl.nasa.gov/api/horizons.api
const ENDPOINT = '/horizons-api';

const MOON = '301';
const SUN = '10';
const EARTH = '399';
const STEP_MINUTES = 60;
const DAY_MS = 86_400_000;

export interface SiteCoordinates {
  lat: number;
  lon: number;
}

/** 'YYYY-MM-DD HH:MM' in UTC — the Horizons time format. */
const horizonsTime = (ms: number) => {
  const iso = new Date(ms).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
};

function buildUrl(
  target: string,
  { lat, lon }: SiteCoordinates,
  startMs: number,
  stopMs: number
): string {
  const params: Record<string, string> = {
    format: 'json',
    COMMAND: `'${target}'`,
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: `'coord@${MOON}'`,
    SITE_COORD: `'${lon},${lat},0'`, // E-longitude, latitude, altitude (km)
    START_TIME: `'${horizonsTime(startMs)}'`,
    STOP_TIME: `'${horizonsTime(stopMs)}'`,
    STEP_SIZE: `'${STEP_MINUTES}m'`,
    QUANTITIES: "'4'", // azimuth and elevation, airless
    ANG_FORMAT: "'DEG'",
    CSV_FORMAT: "'YES'",
  };
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${ENDPOINT}?${query}`;
}

async function fetchBody(
  target: string,
  coordinates: SiteCoordinates,
  startMs: number,
  stopMs: number,
  signal: AbortSignal
) {
  const response = await fetch(buildUrl(target, coordinates, startMs, stopMs), {
    signal,
  });
  if (!response.ok) throw new Error(`Horizons: HTTP ${response.status}`);
  const json = (await response.json()) as { result?: string; error?: string };
  if (json.error || !json.result) {
    throw new Error(json.error ?? 'Horizons: empty response');
  }
  return parseObserverTable(json.result);
}

/**
 * Sun and Earth positions for an observer at a point on the Moon, 60-minute step.
 * Covers [fromMs, fromMs + durationDays] with a one-day margin.
 */
export async function fetchEphemeris(
  coordinates: SiteCoordinates,
  fromMs: number,
  durationDays: number,
  signal: AbortSignal
): Promise<Ephemeris> {
  const startMs = Math.floor(fromMs / 60_000) * 60_000;
  const stopMs = startMs + (Math.ceil(durationDays) + 1) * DAY_MS;

  const [sun, earth] = await Promise.all([
    fetchBody(SUN, coordinates, startMs, stopMs, signal),
    fetchBody(EARTH, coordinates, startMs, stopMs, signal),
  ]);
  if (sun.times.length !== earth.times.length || sun.times.length < 2) {
    throw new Error('Horizons: Sun and Earth tables do not match');
  }
  return {
    startMs: sun.times[0] ?? startMs,
    stepMs: STEP_MINUTES * 60_000,
    sun: { az: sun.az, el: sun.el },
    earth: { az: earth.az, el: earth.el },
  };
}
