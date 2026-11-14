export const SYNODIC_MONTH_DAYS = 29.530588;

const MS_PER_DAY = 86_400_000;
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * MS_PER_DAY;

// Reference new moon: 2000-01-06 18:14 UTC.
// Based on the mean synodic month length: error up to ~14 hours.
// Exact values will come from ephemerides (JPL Horizons).
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

/** Lunar day phase from 0 to 1 (0 — new moon). */
export function lunarPhase(date: Date): number {
  const cycles = (date.getTime() - REFERENCE_NEW_MOON_MS) / SYNODIC_MONTH_MS;
  return cycles - Math.floor(cycles);
}

/** Date with the given phase within the same lunar cycle as `date`. */
export function dateAtPhase(date: Date, phase: number): Date {
  const cycleStartMs = date.getTime() - lunarPhase(date) * SYNODIC_MONTH_MS;
  return new Date(cycleStartMs + phase * SYNODIC_MONTH_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}
