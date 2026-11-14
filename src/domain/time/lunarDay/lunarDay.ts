export const SYNODIC_MONTH_DAYS = 29.530588;

const MS_PER_DAY = 86_400_000;
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * MS_PER_DAY;

// Опорное новолуние: 2000-01-06 18:14 UTC.
// Расчёт по средней длине синодического месяца: ошибка до ~14 часов.
// Точные значения придут из эфемерид (JPL Horizons).
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

/** Фаза лунных суток от 0 до 1 (0 — новолуние). */
export function lunarPhase(date: Date): number {
  const cycles = (date.getTime() - REFERENCE_NEW_MOON_MS) / SYNODIC_MONTH_MS;
  return cycles - Math.floor(cycles);
}

/** Дата с заданной фазой внутри того же лунного цикла, что и `date`. */
export function dateAtPhase(date: Date, phase: number): Date {
  const cycleStartMs = date.getTime() - lunarPhase(date) * SYNODIC_MONTH_MS;
  return new Date(cycleStartMs + phase * SYNODIC_MONTH_MS);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}
