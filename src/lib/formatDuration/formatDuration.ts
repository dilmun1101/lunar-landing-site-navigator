import type { TFunction } from 'i18next';
import type { Duration } from '@/types';

/** `4 days 11 hours`; the plural forms come from i18n. Zero hours are omitted. */
export function formatDuration(
  t: TFunction,
  { days, hours }: Duration
): string {
  const parts: string[] = [];
  if (days > 0) parts.push(t('time.days', { count: days }));
  if (hours > 0 || days === 0) parts.push(t('time.hours', { count: hours }));
  return parts.join(' ');
}

/**
 * Beginner form: whole days (`about 5 days`), or hours when under a day.
 * Minutes and the hour remainder are dropped on purpose.
 */
export function formatDurationRough(
  t: TFunction,
  { days, hours }: Duration
): string {
  const totalHours = days * 24 + hours;
  if (totalHours < 24) return t('time.hours', { count: totalHours });
  return t('time.days', { count: Math.round(totalHours / 24) });
}

/** Picks the exact or the rough form by interface mode */
export function formatDurationFor(
  t: TFunction,
  duration: Duration,
  beginner: boolean
): string {
  return beginner
    ? formatDurationRough(t, duration)
    : formatDuration(t, duration);
}
