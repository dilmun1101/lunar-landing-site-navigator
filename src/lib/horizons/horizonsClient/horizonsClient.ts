import { parseObserverTable } from '@/lib/horizons/parseObserverTable/parseObserverTable';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

// Horizons does not allow requests from other sites (CORS), so we call it
// through a same-origin proxy: see server.proxy / preview.proxy in vite.config.ts.
// The proxy rewrites /horizons-api → https://ssd.jpl.nasa.gov/api/horizons.api
const ENDPOINT = '/horizons-api';

const MOON = '301';
const SUN = '10';
const EARTH = '399';
const DEFAULT_STEP_MINUTES = 60;
const DAY_MS = 86_400_000;
/** Horizons refuses bursts of requests, so only a few run at a time */
const MAX_PARALLEL = 4;
/** A request that hangs must end with an error instead of an endless "Loading" */
const REQUEST_TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 1_000;
/** Tables of this session: the same site and dates are not requested twice */
const CACHE_LIMIT = 200;

type ObserverTable = ReturnType<typeof parseObserverTable>;
const cache = new Map<string, ObserverTable>();

let running = 0;
const waiting: (() => void)[] = [];

/** Runs the task when one of the MAX_PARALLEL slots is free. */
async function queued<T>(task: () => Promise<T>): Promise<T> {
  if (running >= MAX_PARALLEL) {
    await new Promise<void>((resolve) => waiting.push(resolve));
  }
  running++;
  try {
    return await task();
  } finally {
    running--;
    waiting.shift()?.();
  }
}

const isAbort = (error: unknown) =>
  error instanceof Error &&
  (error.name === 'AbortError' || error.name === 'TimeoutError');

async function requestTable(
  url: string,
  signal: AbortSignal
): Promise<ObserverTable> {
  // The caller's cancel and the timeout both stop the request
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined =
    typeof AbortSignal.any === 'function'
      ? AbortSignal.any([signal, timeout])
      : signal;
  const response = await fetch(url, { signal: combined });
  if (!response.ok) throw new Error(`Horizons: HTTP ${response.status}`);
  const json = (await response.json()) as { result?: string; error?: string };
  if (json.error || !json.result) {
    throw new Error(json.error ?? 'Horizons: empty response');
  }
  return parseObserverTable(json.result);
}

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
  stopMs: number,
  stepMinutes: number
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
    STEP_SIZE: `'${stepMinutes}m'`,
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
  stepMinutes: number,
  signal: AbortSignal
) {
  const url = buildUrl(target, coordinates, startMs, stopMs, stepMinutes);
  const cached = cache.get(url);
  if (cached) return cached;

  const table = await queued(async () => {
    try {
      return await requestTable(url, signal);
    } catch (error) {
      // A cancel or a timeout is final; any other failure gets one more try
      if (isAbort(error) || signal.aborted) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return requestTable(url, signal);
    }
  });
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(url, table);
  return table;
}

/**
 * Sun and Earth positions for an observer at a point on the Moon, 60-minute step by default.
 * A coarser step makes the request much faster. Covers [fromMs, fromMs + durationDays] with a one-day margin.
 */
export async function fetchEphemeris(
  coordinates: SiteCoordinates,
  fromMs: number,
  durationDays: number,
  signal: AbortSignal,
  stepMinutes = DEFAULT_STEP_MINUTES
): Promise<Ephemeris> {
  const startMs = Math.floor(fromMs / 60_000) * 60_000;
  const stopMs = startMs + (Math.ceil(durationDays) + 1) * DAY_MS;

  const [sun, earth] = await Promise.all([
    fetchBody(SUN, coordinates, startMs, stopMs, stepMinutes, signal),
    fetchBody(EARTH, coordinates, startMs, stopMs, stepMinutes, signal),
  ]);
  if (sun.times.length !== earth.times.length || sun.times.length < 2) {
    throw new Error('Horizons: Sun and Earth tables do not match');
  }
  return {
    startMs: sun.times[0] ?? startMs,
    stepMs: stepMinutes * 60_000,
    sun: { az: sun.az, el: sun.el },
    earth: { az: earth.az, el: earth.el },
  };
}
