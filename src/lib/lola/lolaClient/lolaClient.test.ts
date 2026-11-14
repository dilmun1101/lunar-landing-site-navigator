import { describe, expect, it } from 'vitest';
import { planWindows } from '@/lib/lola/lolaClient/lolaClient';

describe('planWindows', () => {
  it('returns one window around an ordinary point', () => {
    const windows = planWindows(0, 0, 120);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.west).toBeLessThan(0);
    expect(windows[0]?.east).toBeGreaterThan(0);
    expect(windows[0]?.south).toBeLessThan(0);
    expect(windows[0]?.north).toBeGreaterThan(0);
  });

  it('covers all longitudes near the pole', () => {
    expect(planWindows(-89.5, 30, 120)).toEqual([
      expect.objectContaining({ west: -180, east: 180, south: -90 }),
    ]);
  });

  it('splits a window that crosses the 180° meridian', () => {
    const windows = planWindows(-84, 175, 120);
    expect(windows).toHaveLength(2);
    expect(windows[0]?.east).toBe(180);
    expect(windows[1]?.west).toBe(-180);
  });
});
