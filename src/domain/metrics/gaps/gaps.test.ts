import { describe, expect, it } from 'vitest';
import { longestGapMs } from '@/domain/metrics/gaps/gaps';

describe('longestGapMs', () => {
  it('finds the longest gap between segments', () => {
    expect(
      longestGapMs(
        [
          [1, 2],
          [4, 5],
        ],
        0,
        6
      )
    ).toBe(2);
  });

  it('counts the gap at the start and at the end', () => {
    expect(longestGapMs([[3, 4]], 0, 10)).toBe(6);
    expect(longestGapMs([[6, 10]], 0, 10)).toBe(6);
  });

  it('returns the whole period if nothing is covered', () => {
    expect(longestGapMs([], 0, 10)).toBe(10);
  });

  it('returns 0 if everything is covered', () => {
    expect(longestGapMs([[0, 10]], 0, 10)).toBe(0);
  });
});
