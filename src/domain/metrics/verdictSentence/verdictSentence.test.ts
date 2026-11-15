import { describe, expect, it } from 'vitest';
import { frequencyFor, verdictSentence } from './verdictSentence';

describe('frequencyFor', () => {
  it('maps percentages to plain words', () => {
    expect(frequencyFor(100)).toBe('always');
    expect(frequencyFor(85)).toBe('always');
    expect(frequencyFor(84)).toBe('mostly');
    expect(frequencyFor(50)).toBe('mostly');
    expect(frequencyFor(20)).toBe('sometimes');
    expect(frequencyFor(19)).toBe('rarely');
    expect(frequencyFor(0)).toBe('rarely');
  });
});

describe('verdictSentence', () => {
  const base = { sunlightPercent: 90, earthLinkPercent: 70 };

  it('has no reason for a viable place', () => {
    const result = verdictSentence({
      ...base,
      verdict: 'viable',
      blackoutExceeded: false,
    });
    expect(result).toEqual({
      verdict: 'viable',
      sun: 'always',
      earth: 'mostly',
      reason: null,
    });
  });

  it('blames the battery first', () => {
    expect(
      verdictSentence({
        ...base,
        verdict: 'not-viable',
        blackoutExceeded: true,
      }).reason
    ).toBe('battery');
  });

  it('blames the weaker of sun and Earth otherwise', () => {
    expect(
      verdictSentence({
        verdict: 'marginal',
        sunlightPercent: 30,
        earthLinkPercent: 60,
        blackoutExceeded: false,
      }).reason
    ).toBe('sun');
    expect(
      verdictSentence({
        verdict: 'not-viable',
        sunlightPercent: 80,
        earthLinkPercent: 10,
        blackoutExceeded: false,
      }).reason
    ).toBe('earth');
  });
});
