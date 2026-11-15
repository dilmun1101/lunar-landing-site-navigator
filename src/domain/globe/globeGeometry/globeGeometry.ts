/**
 * Geometry of the 3D Moon globe. No React and no three.js: plain vectors,
 * so the formulas can be tested on their own.
 *
 * Axes (three.js: Y is up): +Y is the lunar north pole, longitude 0 / latitude 0
 * looks along +Z (toward the default camera), east longitude grows toward +X.
 */

export type Vec3 = readonly [number, number, number];

const DEG = Math.PI / 180;

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function normalize(a: Vec3): Vec3 {
  const length = Math.hypot(a[0], a[1], a[2]);
  return length === 0 ? [0, 0, 0] : scale(a, 1 / length);
}

/** Point on the sphere of the given radius for a latitude and an east longitude (degrees). */
export function surfacePoint(lat: number, lon: number, radius = 1): Vec3 {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return [
    radius * Math.cos(phi) * Math.sin(lambda),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lambda),
  ];
}

export interface LocalFrame {
  /** Away from the surface */
  up: Vec3;
  east: Vec3;
  north: Vec3;
}

/** The local frame of a site: where up, east and north point in globe coordinates. */
export function localFrame(lat: number, lon: number): LocalFrame {
  const up = surfacePoint(lat, lon);
  const rawEast = cross([0, 1, 0], up);
  // At the poles every direction is "east"; pick a fixed one so the frame stays defined.
  const east: Vec3 =
    Math.hypot(...rawEast) < 1e-9 ? [1, 0, 0] : normalize(rawEast);
  return { up, east, north: normalize(cross(up, east)) };
}

/**
 * Unit direction from a site to a body, in globe coordinates.
 * azimuth: degrees clockwise from north; elevation: degrees above the local horizon.
 */
export function directionToBody(
  lat: number,
  lon: number,
  azimuth: number,
  elevation: number
): Vec3 {
  const { up, east, north } = localFrame(lat, lon);
  const az = azimuth * DEG;
  const el = elevation * DEG;
  const horizontal = add(scale(north, Math.cos(az)), scale(east, Math.sin(az)));
  return normalize(
    add(scale(horizontal, Math.cos(el)), scale(up, Math.sin(el)))
  );
}

/**
 * Is the site in daylight from the point of view of the globe: the Sun is above
 * the local horizon. Used to tint the lit side of the marker.
 */
export const isAboveHorizon = (direction: Vec3, lat: number, lon: number) =>
  dot(direction, surfacePoint(lat, lon)) > 0;
