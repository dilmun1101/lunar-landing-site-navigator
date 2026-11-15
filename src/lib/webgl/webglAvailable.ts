let cached: boolean | undefined;

/** Can this browser draw WebGL? (the 3D globe needs it). Checked once. */
export function webglAvailable(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    cached = false;
  }
  return cached;
}
