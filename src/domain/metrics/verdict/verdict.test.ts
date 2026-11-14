import { describe, expect, it } from 'vitest';
import { verdictFor } from '@/domain/metrics/verdict/verdict';

describe('verdictFor', () => {
  it('uses the default thresholds', () => {
    expect(verdictFor(60)).toBe('viable');
    expect(verdictFor(59)).toBe('marginal');
    expect(verdictFor(30)).toBe('marginal');
    expect(verdictFor(29)).toBe('not-viable');
  });

  it('uses the thresholds from the criteria', () => {
    const criteria = { viablePercent: 90, marginalPercent: 50 };
    expect(verdictFor(80, criteria)).toBe('marginal');
    expect(verdictFor(95, criteria)).toBe('viable');
    expect(verdictFor(40, criteria)).toBe('not-viable');
  });
});
