import type { MsSegment } from '@/domain/metrics/windows/windows';

/**
 * The longest period inside [fromMs, toMs] that is not covered by the segments, in milliseconds.
 * For the visibility segments of the Sun this is the longest darkness, for the Earth — the longest
 * loss of communication. The segments must be sorted and lie within [fromMs, toMs].
 */
export function longestGapMs(
  covered: MsSegment[],
  fromMs: number,
  toMs: number
): number {
  let longest = 0;
  let cursor = fromMs;
  for (const [start, end] of covered) {
    longest = Math.max(longest, start - cursor);
    cursor = Math.max(cursor, end);
  }
  return Math.max(longest, toMs - cursor);
}
