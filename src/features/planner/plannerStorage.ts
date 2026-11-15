import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

const PREFIX = 'planner-ephemeris:v1:';

const round = (values: number[]) =>
  values.map((value) => Math.round(value * 100) / 100);

/** The ephemeris saved earlier (this session or an earlier one), otherwise null. */
export function readStoredEphemeris(key: string): Ephemeris | null {
  try {
    const stored = localStorage.getItem(PREFIX + key);
    return stored ? (JSON.parse(stored) as Ephemeris) : null;
  } catch {
    return null;
  }
}

export function forgetStoredEphemeris(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // storage is unavailable — nothing to forget
  }
}

/** Removes the saved ephemerides whose key does not end with the scope (an earlier date or duration). */
function removeOutdated(scope: string): void {
  for (let index = localStorage.length - 1; index >= 0; index--) {
    const name = localStorage.key(index);
    if (name?.startsWith(PREFIX) && !name.endsWith(`|${scope}`)) {
      localStorage.removeItem(name);
    }
  }
}

/**
 * Saves the ephemeris so that the next visit does not request it again.
 * The key ends with `|scope`; data of other scopes is removed to keep the storage small.
 */
export function storeEphemeris(
  key: string,
  scope: string,
  ephemeris: Ephemeris
): void {
  const compact: Ephemeris = {
    startMs: ephemeris.startMs,
    stepMs: ephemeris.stepMs,
    sun: { az: round(ephemeris.sun.az), el: round(ephemeris.sun.el) },
    earth: { az: round(ephemeris.earth.az), el: round(ephemeris.earth.el) },
  };
  try {
    removeOutdated(scope);
    localStorage.setItem(PREFIX + key, JSON.stringify(compact));
  } catch {
    // ignore: only the persistent cache is lost
  }
}
