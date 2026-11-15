import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@/domain/ephemeris/sunEarthPosition/sunEarthPosition';
import {
  azimuthTicks,
  azimuthToX,
  elevationTicks,
  elevationToY,
  highestElevationBetween,
  panoramaMaxElevation,
  placeBody,
  terrainPath,
} from '@/domain/horizon/panorama/panorama';

const SIZE = { width: 360, height: 100 };
const flat = Array.from({ length: 72 }, () => 0);

describe('azimuthToX', () => {
  it('puts north at the edges and wraps around', () => {
    expect(azimuthToX(0, 360)).toBe(0);
    expect(azimuthToX(90, 360)).toBe(90);
    expect(azimuthToX(180, 720)).toBe(360);
    expect(azimuthToX(360, 360)).toBe(0);
    expect(azimuthToX(-90, 360)).toBe(270);
  });
});

describe('elevationToY', () => {
  it('has the horizon at the bottom and pins values to the edges', () => {
    expect(elevationToY(0, 100, 10)).toBe(100);
    expect(elevationToY(10, 100, 10)).toBe(0);
    expect(elevationToY(5, 100, 10)).toBe(50);
    expect(elevationToY(-3, 100, 10)).toBe(100);
    expect(elevationToY(30, 100, 10)).toBe(0);
  });
});

describe('panoramaMaxElevation', () => {
  it('is at least 10° and moves in steps of 5°', () => {
    expect(panoramaMaxElevation(flat, 1)).toBe(10);
    const ridge = flat.map((_, index) => (index === 10 ? 8 : 0));
    expect(panoramaMaxElevation(ridge, 2)).toBe(10);
    expect(
      panoramaMaxElevation(
        ridge.map((v) => v * 2),
        2
      )
    ).toBe(20);
  });

  it('follows a high Sun but never goes past 90°', () => {
    expect(panoramaMaxElevation(flat, 40)).toBe(45);
    expect(panoramaMaxElevation(flat, 89)).toBe(90);
  });
});

describe('highestElevationBetween', () => {
  const ephemeris: Ephemeris = {
    startMs: 0,
    stepMs: 1000,
    sun: { az: [0, 0, 0, 0], el: [1, 5, 2, 9] },
    earth: { az: [0, 0, 0, 0], el: [3, 4, 7, 1] },
  };

  it('looks at the samples inside the range only', () => {
    expect(highestElevationBetween(ephemeris, 0, 1000)).toBe(5);
    expect(highestElevationBetween(ephemeris, 2000, 3000)).toBe(9);
    expect(highestElevationBetween(ephemeris, 0, 100_000)).toBe(9);
  });
});

describe('terrainPath', () => {
  it('closes the silhouette along the bottom', () => {
    const path = terrainPath([0, 5, 0, 5], SIZE, 10);
    expect(path.startsWith('M0,100 L0,100')).toBe(true);
    expect(path.endsWith('L360,100 Z')).toBe(true);
    // 4 profile points + the wrap-around point on the right edge
    expect(path.match(/L/g)?.length).toBe(1 + 5 + 1);
  });

  it('draws a flat strip for an empty profile', () => {
    expect(terrainPath([], SIZE, 10)).toBe('M0,100 L360,100 Z');
  });
});

describe('placeBody', () => {
  const ridge = flat.map((_, index) => (index >= 17 && index <= 19 ? 4 : 0));

  it('shows a body above the terrain', () => {
    const body = placeBody({ azimuth: 90, elevation: 5 }, ridge, SIZE, 10);
    expect(body).toEqual({ x: 90, y: 50, state: 'visible', offScale: false });
  });

  it('marks a body behind a ridge', () => {
    // index 18 is azimuth 90°: the ridge there is 4°
    const body = placeBody({ azimuth: 90, elevation: 2 }, ridge, SIZE, 10);
    expect(body.state).toBe('behindTerrain');
  });

  it('marks a body below the horizon', () => {
    const body = placeBody({ azimuth: 10, elevation: -1 }, flat, SIZE, 10);
    expect(body.state).toBe('belowHorizon');
    expect(body.y).toBe(100);
  });

  it('pins a body that is higher than the scale', () => {
    const body = placeBody({ azimuth: 10, elevation: 50 }, flat, SIZE, 10);
    expect(body.offScale).toBe(true);
    expect(body.y).toBe(0);
  });
});

describe('ticks', () => {
  it('has every 90° for the four directions', () => {
    expect(azimuthTicks(90, 360).map((tick) => tick.value)).toEqual([
      0, 90, 180, 270,
    ]);
    expect(azimuthTicks(90, 360).map((tick) => tick.position)).toEqual([
      0, 90, 180, 270,
    ]);
  });

  it('has elevation marks up to the top of the scale', () => {
    expect(elevationTicks(5, 100, 10)).toEqual([
      { value: 0, position: 100 },
      { value: 5, position: 50 },
      { value: 10, position: 0 },
    ]);
  });
});
