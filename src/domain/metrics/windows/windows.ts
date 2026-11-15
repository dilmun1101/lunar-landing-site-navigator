import {
  type BodySeries,
  positionAt,
  type Timeline,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

/** Time segment [start, end] in milliseconds UTC. */
export type MsSegment = [number, number];

const DAY_MS = 86_400_000;

/**
 * Intervals within [fromMs, toMs] when the body's elevation is above the threshold (0° by default — the geometric
 * horizon without terrain). Elevation between samples is treated as linear, so crossing times
 * are exact. fromMs and toMs must lie within the data range.
 */
export function aboveHorizon(
  series: BodySeries,
  timeline: Timeline,
  fromMs: number,
  toMs: number,
  threshold = 0
): MsSegment[] {
  const elevationAt = (ms: number) =>
    positionAt(series, timeline, ms)?.elevation ?? Number.NaN;

  const startElevation = elevationAt(fromMs);
  const points: [number, number][] = [[fromMs, startElevation]];
  const first = Math.floor((fromMs - timeline.startMs) / timeline.stepMs) + 1;
  const last = Math.ceil((toMs - timeline.startMs) / timeline.stepMs) - 1;
  for (let index = first; index <= last; index++) {
    points.push([
      timeline.startMs + index * timeline.stepMs,
      series.el[index] ?? Number.NaN,
    ]);
  }
  points.push([toMs, elevationAt(toMs)]);

  const segments: MsSegment[] = [];
  let open: number | null = startElevation > threshold ? fromMs : null;
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const current = points[index];
    if (!previous || !current) continue;
    const [t0, e0] = previous;
    const [t1, e1] = current;
    const wasAbove = e0 > threshold;
    const isAbove = e1 > threshold;
    if (wasAbove === isAbove) continue;
    const crossing = t0 + ((t1 - t0) * (threshold - e0)) / (e1 - e0);
    if (isAbove) {
      open = crossing;
    } else if (open !== null) {
      segments.push([open, crossing]);
      open = null;
    }
  }
  if (open !== null) segments.push([open, toMs]);
  return segments;
}

/** Intersection of two sorted lists of segments. */
export function intersect(a: MsSegment[], b: MsSegment[]): MsSegment[] {
  const result: MsSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const first = a[i];
    const second = b[j];
    if (!first || !second) break;
    const start = Math.max(first[0], second[0]);
    const end = Math.min(first[1], second[1]);
    if (start < end) result.push([start, end]);
    if (first[1] < second[1]) i++;
    else j++;
  }
  return result;
}

export const totalMs = (segments: MsSegment[]) =>
  segments.reduce((sum, [start, end]) => sum + (end - start), 0);

/** Converts segments to days from fromMs (for on-screen scales). */
export const toDaySegments = (
  segments: MsSegment[],
  fromMs: number
): [number, number][] =>
  segments.map(([start, end]) => [
    (start - fromMs) / DAY_MS,
    (end - fromMs) / DAY_MS,
  ]);
