import type { Verdict } from '@/types';

export type Frequency = 'always' | 'mostly' | 'sometimes' | 'rarely';

/** Why the place is not fully viable; null when nothing is wrong */
export type Reason = 'battery' | 'sun' | 'earth' | null;

export interface VerdictSentence {
  verdict: Verdict;
  sun: Frequency;
  earth: Frequency;
  reason: Reason;
}

/** Share of the mission → a plain word instead of a percentage */
export function frequencyFor(percent: number): Frequency {
  if (percent >= 85) return 'always';
  if (percent >= 50) return 'mostly';
  if (percent >= 20) return 'sometimes';
  return 'rarely';
}

/** The parts of a one-sentence verdict for beginners; the words come from i18n */
export function verdictSentence(input: {
  verdict: Verdict;
  sunlightPercent: number;
  earthLinkPercent: number;
  blackoutExceeded: boolean;
}): VerdictSentence {
  const { verdict, sunlightPercent, earthLinkPercent, blackoutExceeded } =
    input;

  let reason: Reason = null;
  if (blackoutExceeded) reason = 'battery';
  else if (verdict !== 'viable') {
    reason = sunlightPercent <= earthLinkPercent ? 'sun' : 'earth';
  }

  return {
    verdict,
    sun: frequencyFor(sunlightPercent),
    earth: frequencyFor(earthLinkPercent),
    reason,
  };
}
