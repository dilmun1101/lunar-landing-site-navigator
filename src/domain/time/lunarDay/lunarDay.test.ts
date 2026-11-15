import { describe, expect, it } from 'vitest';
import {
  addDays,
  dateAtPhase,
  lunarPhase,
} from '@/domain/time/lunarDay/lunarDay';

describe('lunarPhase', () => {
  it('is 0 at the reference new moon', () => {
    expect(lunarPhase(new Date('2000-01-06T18:14:00Z'))).toBeCloseTo(0, 9);
  });

  it('is about 0.5 half a month later', () => {
    const date = new Date(
      Date.UTC(2000, 0, 6, 18, 14) + 14.765294 * 86_400_000
    );
    expect(lunarPhase(date)).toBeCloseTo(0.5, 6);
  });

  it('stays within [0, 1)', () => {
    for (const iso of [
      '1990-03-01T00:00:00Z',
      '2026-11-14T12:00:00Z',
      '2040-07-20T23:59:00Z',
    ]) {
      const phase = lunarPhase(new Date(iso));
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThan(1);
    }
  });
});

describe('dateAtPhase', () => {
  it('round-trips the requested phase', () => {
    const date = new Date('2026-11-14T12:00:00Z');
    expect(lunarPhase(dateAtPhase(date, 0.42))).toBeCloseTo(0.42, 6);
  });
});

describe('addDays', () => {
  it('adds and subtracts whole days', () => {
    const date = new Date('2026-11-14T12:00:00Z');
    expect(addDays(date, 1).toISOString()).toBe('2026-11-15T12:00:00.000Z');
    expect(addDays(date, -1).toISOString()).toBe('2026-11-13T12:00:00.000Z');
  });
});
