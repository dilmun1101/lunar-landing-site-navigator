/**
 * Suitability criteria of a landing site. The values are project assumptions
 * (not NASA requirements) and can be changed by the user.
 */
export interface Criteria {
  /** The Sun counts as lit only if it is this high above the terrain horizon, degrees */
  minSunElevation: number;
  /** The Earth counts as visible only if it is this high above the terrain horizon, degrees */
  minEarthElevation: number;
  /** Periods with both Sun and Earth shorter than this are not counted, hours */
  minWindowHours: number;
  /** The site is "viable" from this share of the mission with power and communication, percent */
  viablePercent: number;
  /** The site is "marginal" from this share, percent */
  marginalPercent: number;
}

export const defaultCriteria: Criteria = {
  minSunElevation: 0,
  minEarthElevation: 0,
  minWindowHours: 0,
  viablePercent: 60,
  marginalPercent: 30,
};

/** Allowed range and input step of every criterion. */
export const criteriaLimits: Record<
  keyof Criteria,
  { min: number; max: number; step: number }
> = {
  minSunElevation: { min: 0, max: 10, step: 0.5 },
  minEarthElevation: { min: 0, max: 10, step: 0.5 },
  minWindowHours: { min: 0, max: 240, step: 1 },
  viablePercent: { min: 0, max: 100, step: 5 },
  marginalPercent: { min: 0, max: 100, step: 5 },
};

/** Keeps the value of a criterion inside its allowed range. */
export const clampCriterion = (key: keyof Criteria, value: number): number => {
  const { min, max } = criteriaLimits[key];
  return Math.min(max, Math.max(min, value));
};
