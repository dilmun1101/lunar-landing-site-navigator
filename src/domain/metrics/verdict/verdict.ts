import type { Verdict } from '@/types';

// Conventional thresholds: share of the mission with both sunlight and Earth link.
// This is a project assumption, not a NASA requirement — adjust to your goals.
const VIABLE_FROM_PERCENT = 60;
const MARGINAL_FROM_PERCENT = 30;

export function verdictFor(windowPercent: number): Verdict {
  if (windowPercent >= VIABLE_FROM_PERCENT) return 'viable';
  if (windowPercent >= MARGINAL_FROM_PERCENT) return 'marginal';
  return 'not-viable';
}
