export const lerp = (a: number, b: number, fraction: number) =>
  a + (b - a) * fraction;

/** Interpolates angles in degrees along the shorter arc (across 0°/360°). */
export function lerpAngle(a: number, b: number, fraction: number): number {
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return (((a + delta * fraction) % 360) + 360) % 360;
}
