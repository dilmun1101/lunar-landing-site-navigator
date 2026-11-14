import { lerp, lerpAngle } from '@/domain/ephemeris/interpolate/interpolate';

export interface BodySeries {
  /** Azimuth, degrees clockwise from north */
  az: number[];
  /** Elevation above the horizon, degrees (airless) */
  el: number[];
}

/** Uniform sample grid: time of the i-th sample = startMs + i * stepMs. */
export interface Timeline {
  startMs: number;
  stepMs: number;
}

export interface Ephemeris extends Timeline {
  sun: BodySeries;
  earth: BodySeries;
}

export interface SkyPosition {
  azimuth: number;
  elevation: number;
}

export const sampleCount = (series: BodySeries) => series.el.length;

export const endMs = (timeline: Timeline, series: BodySeries) =>
  timeline.startMs + (sampleCount(series) - 1) * timeline.stepMs;

/** Position of the body at time ms; null if the moment is outside the data range. */
export function positionAt(
  series: BodySeries,
  timeline: Timeline,
  ms: number
): SkyPosition | null {
  const index = (ms - timeline.startMs) / timeline.stepMs;
  if (index < 0 || index > sampleCount(series) - 1) return null;
  const lower = Math.floor(index);
  const upper = Math.min(lower + 1, sampleCount(series) - 1);
  const fraction = index - lower;
  return {
    azimuth: lerpAngle(series.az[lower], series.az[upper], fraction),
    elevation: lerp(series.el[lower], series.el[upper], fraction),
  };
}
