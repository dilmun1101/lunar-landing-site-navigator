import { describe, expect, it } from 'vitest';
import { skyBodyPosition } from '@/domain/terrain/skyBodyPosition/skyBodyPosition';

describe('skyBodyPosition', () => {
  it('puts the north on the -Z axis', () => {
    const [x, y, z] = skyBodyPosition(0, 0, 100);
    expect(x).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0, 6);
    expect(z).toBeCloseTo(-100, 6);
  });

  it('puts the east on +X and the south on +Z', () => {
    expect(skyBodyPosition(90, 0, 50)[0]).toBeCloseTo(50, 6);
    expect(skyBodyPosition(180, 0, 50)[2]).toBeCloseTo(50, 6);
  });

  it('puts the zenith straight up and raises bodies with elevation', () => {
    expect(skyBodyPosition(123, 90, 70)[1]).toBeCloseTo(70, 6);
    expect(skyBodyPosition(0, 30, 100)[1]).toBeCloseTo(50, 6);
  });

  it('keeps the distance', () => {
    const [x, y, z] = skyBodyPosition(217, -12, 200);
    expect(Math.hypot(x, y, z)).toBeCloseTo(200, 6);
  });
});
