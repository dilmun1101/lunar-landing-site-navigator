import { type Criteria, defaultCriteria } from '@/domain/criteria/criteria';
import type { Verdict } from '@/types';

/**
 * Verdict by the share of the mission with both sunlight and Earth link.
 * The thresholds come from the criteria; by default they are a project assumption, not a NASA requirement.
 */
export function verdictFor(
  windowPercent: number,
  criteria: Pick<
    Criteria,
    'viablePercent' | 'marginalPercent'
  > = defaultCriteria
): Verdict {
  if (windowPercent >= criteria.viablePercent) return 'viable';
  if (windowPercent >= criteria.marginalPercent) return 'marginal';
  return 'not-viable';
}
