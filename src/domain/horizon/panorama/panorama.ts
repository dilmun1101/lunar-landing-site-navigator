import type { HorizonProfile } from '@/domain/horizon/horizonProfile/horizonProfile';
import { terrainElevationAt } from '@/domain/horizon/horizonProfile/horizonProfile';
import type {
  Ephemeris,
  SkyPosition,
} from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';

/** Elevation range of the panorama, degrees. The scale starts at the geometric horizon. */
const MIN_TOP_ELEVATION = 10;
const MAX_TOP_ELEVATION = 90;
const SCALE_STEP = 5;
/** A little room above the highest ridge or body */
const HEADROOM = 2;

export interface PanoramaSize {
  width: number;
  height: number;
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Azimuth (degrees, clockwise from north) → x. North is both edges of the strip. */
export function azimuthToX(azimuth: number, width: number): number {
  const normalized = ((azimuth % 360) + 360) % 360;
  return round((normalized / 360) * width);
}

/** Elevation → y (0 at the top). Values outside 0…maxElevation are pinned to the edges. */
export function elevationToY(
  elevation: number,
  height: number,
  maxElevation: number
): number {
  const clamped = Math.min(Math.max(elevation, 0), maxElevation);
  return round(height - (clamped / maxElevation) * height);
}

/**
 * Top of the vertical scale, degrees: above the highest ridge and body, in steps of 5°,
 * between 10° (polar sites) and 90°. It is computed once per scenario, so the picture
 * does not jump while the time is playing.
 */
export function panoramaMaxElevation(
  terrain: HorizonProfile,
  highestBody: number
): number {
  const ridge = terrain.reduce((max, value) => Math.max(max, value), 0);
  const needed = Math.max(ridge, highestBody) + HEADROOM;
  const stepped = Math.ceil(needed / SCALE_STEP) * SCALE_STEP;
  return Math.min(Math.max(stepped, MIN_TOP_ELEVATION), MAX_TOP_ELEVATION);
}

/** The highest elevation of the Sun and the Earth in [fromMs, toMs] by the samples of the data */
export function highestElevationBetween(
  ephemeris: Ephemeris,
  fromMs: number,
  toMs: number
): number {
  const first = Math.max(
    0,
    Math.floor((fromMs - ephemeris.startMs) / ephemeris.stepMs)
  );
  const last = Math.ceil((toMs - ephemeris.startMs) / ephemeris.stepMs);
  let highest = 0;
  for (const series of [ephemeris.sun, ephemeris.earth]) {
    const end = Math.min(last, series.el.length - 1);
    for (let index = first; index <= end; index++) {
      highest = Math.max(highest, series.el[index] ?? 0);
    }
  }
  return highest;
}

/**
 * Closed SVG path of the terrain silhouette: the profile (every 360/N degrees from north),
 * closed back to north on the right edge, filled down to the bottom of the strip.
 */
export function terrainPath(
  terrain: HorizonProfile,
  { width, height }: PanoramaSize,
  maxElevation: number
): string {
  const count = terrain.length;
  if (count === 0) return `M0,${height} L${width},${height} Z`;
  const points: string[] = [];
  for (let index = 0; index <= count; index++) {
    const elevation = terrain[index % count] ?? 0;
    const x = round((index / count) * width);
    points.push(`${x},${elevationToY(elevation, height, maxElevation)}`);
  }
  return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
}

export type BodyState = 'visible' | 'behindTerrain' | 'belowHorizon';

export interface PanoramaBody {
  x: number;
  y: number;
  state: BodyState;
  /** The body is higher than the scale: it is pinned to the top edge */
  offScale: boolean;
}

/** Where a body is drawn and whether the terrain hides it */
export function placeBody(
  position: SkyPosition,
  terrain: HorizonProfile,
  size: PanoramaSize,
  maxElevation: number
): PanoramaBody {
  let state: BodyState = 'visible';
  if (position.elevation <= 0) state = 'belowHorizon';
  else if (position.elevation < terrainElevationAt(terrain, position.azimuth)) {
    state = 'behindTerrain';
  }
  return {
    x: azimuthToX(position.azimuth, size.width),
    y: elevationToY(position.elevation, size.height, maxElevation),
    state,
    offScale: position.elevation > maxElevation,
  };
}

export interface Tick {
  value: number;
  position: number;
}

/** Marks along the azimuth axis: 0°, 30°, 60°… (0° is north, drawn at the left edge) */
export function azimuthTicks(step: number, width: number): Tick[] {
  const ticks: Tick[] = [];
  for (let value = 0; value < 360; value += step) {
    ticks.push({ value, position: azimuthToX(value, width) });
  }
  return ticks;
}

/** Marks along the elevation axis: 0°, 5°, 10°… up to the top of the scale */
export function elevationTicks(
  step: number,
  height: number,
  maxElevation: number
): Tick[] {
  const ticks: Tick[] = [];
  for (let value = 0; value <= maxElevation; value += step) {
    ticks.push({ value, position: elevationToY(value, height, maxElevation) });
  }
  return ticks;
}
