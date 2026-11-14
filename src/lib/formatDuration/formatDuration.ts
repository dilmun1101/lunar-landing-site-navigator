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
