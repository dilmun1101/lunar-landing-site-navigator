import { describe, expect, it } from 'vitest';
import {
  directionToBody,
  isAboveHorizon,
  localFrame,
  surfacePoint,
  type Vec3,
} from '@/domain/globe/globeGeometry/globeGeometry';

const expectVec = (actual: Vec3, expected: Vec3) => {
  for (let i = 0; i < 3; i++) {
    expect(actual[i]).toBeCloseTo(expected[i] as number, 6);
  }
};

describe('surfacePoint', () => {
  it('puts (0, 0) on the +Z axis', () => {
    expectVec(surfacePoint(0, 0), [0, 0, 1]);
  });

  it('puts the poles on the Y axis', () => {
    expectVec(surfacePoint(90, 0), [0, 1, 0]);
    expectVec(surfacePoint(-90, 123), [0, -1, 0]);
  });

  it('moves east longitude toward +X', () => {
    expectVec(surfacePoint(0, 90), [1, 0, 0]);
    expectVec(surfacePoint(0, -90), [-1, 0, 0]);
  });

  it('scales by radius', () => {
    const p = surfacePoint(30, 40, 2.5);
    expect(Math.hypot(...p)).toBeCloseTo(2.5, 9);
  });
});

describe('localFrame', () => {
  it('has east +X, north +Y, up +Z at (0, 0)', () => {
    const f = localFrame(0, 0);
    expectVec(f.east, [1, 0, 0]);
    expectVec(f.north, [0, 1, 0]);
    expectVec(f.up, [0, 0, 1]);
  });

  it('stays defined at the poles', () => {
    const f = localFrame(-89.9999999, 0);
    expect(Math.hypot(...f.east)).toBeCloseTo(1, 6);
    expect(Math.hypot(...localFrame(90, 0).north)).toBeCloseTo(1, 6);
  });

  it('keeps the three axes perpendicular', () => {
    const f = localFrame(-43, 17);
    const d = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    expect(d(f.up, f.east)).toBeCloseTo(0, 9);
    expect(d(f.up, f.north)).toBeCloseTo(0, 9);
    expect(d(f.east, f.north)).toBeCloseTo(0, 9);
  });
});

describe('directionToBody', () => {
  it('looks up at elevation 90', () => {
    expectVec(directionToBody(0, 0, 123, 90), [0, 0, 1]);
  });

  it('looks north along the horizon at azimuth 0', () => {
    expectVec(directionToBody(0, 0, 0, 0), [0, 1, 0]);
  });

  it('looks east at azimuth 90', () => {
    expectVec(directionToBody(0, 0, 90, 0), [1, 0, 0]);
  });

  it('looks south at azimuth 180', () => {
    expectVec(directionToBody(0, 0, 180, 0), [0, -1, 0]);
  });

  it('returns a unit vector', () => {
    const d = directionToBody(-89.5, 20, 215, 3);
    expect(Math.hypot(...d)).toBeCloseTo(1, 9);
  });
});

describe('isAboveHorizon', () => {
  it('is true for positive elevation, false for negative', () => {
    expect(isAboveHorizon(directionToBody(-80, 10, 40, 2), -80, 10)).toBe(true);
    expect(isAboveHorizon(directionToBody(-80, 10, 40, -2), -80, 10)).toBe(
      false
    );
  });
});
