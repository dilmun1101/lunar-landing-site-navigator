import { describe, expect, it } from 'vitest';
import { formatUtcDateTime, parseUtcDateTime } from '@/lib/format/format';

const date = new Date('2026-01-05T03:07:00Z');

describe('formatUtcDateTime', () => {
  it('uses year-month-day for English', () => {
    expect(formatUtcDateTime(date, 'en')).toBe('2026-01-05 03:07');
  });

  it('uses day.month.year for Russian', () => {
    expect(formatUtcDateTime(date, 'ru')).toBe('05.01.2026 03:07');
    expect(formatUtcDateTime(date, 'ru-RU')).toBe('05.01.2026 03:07');
  });
});

describe('parseUtcDateTime', () => {
  it('parses ISO with a space or T separator', () => {
    expect(parseUtcDateTime('2026-11-14 12:00')?.toISOString()).toBe(
      '2026-11-14T12:00:00.000Z'
    );
    expect(parseUtcDateTime('2026-11-14T12:00')?.toISOString()).toBe(
      '2026-11-14T12:00:00.000Z'
    );
  });

  it('parses the Russian format', () => {
    expect(parseUtcDateTime('14.11.2026 12:00')?.toISOString()).toBe(
      '2026-11-14T12:00:00.000Z'
    );
  });

  it('round-trips both formats', () => {
    for (const language of ['en', 'ru']) {
      const text = formatUtcDateTime(date, language);
      expect(parseUtcDateTime(text)?.getTime()).toBe(date.getTime());
    }
  });

  it('rejects wrong formats and impossible values', () => {
    expect(parseUtcDateTime('')).toBeNull();
    expect(parseUtcDateTime('11/14/2026 12:00')).toBeNull();
    expect(parseUtcDateTime('2026-02-31 12:00')).toBeNull();
    expect(parseUtcDateTime('31.02.2026 12:00')).toBeNull();
    expect(parseUtcDateTime('2026-11-14 25:00')).toBeNull();
  });
});
