import { describe, expect, it } from 'vitest';
import { createElevationModel } from '@/lib/lola/elevationWindow/elevationWindow';

// 2x2 pixels over lon 0…2, lat 0…2 (north row first); meters
const tile = {
  west: 0,
  east: 2,
  south: 0,
  north: 2,
  width: 2,
  height: 2,
  data: Int16Array.from([1000, 2000, 3000, 4000]),
};

describe('createElevationModel', () => {
  const model = createElevationModel([tile]);

  it('returns pixel values (in km) at the pixel centers', () => {
    expect(model.heightAt(1.5, 0.5)).toBeCloseTo(1);
    expect(model.heightAt(1.5, 1.5)).toBeCloseTo(2);
    expect(model.heightAt(0.5, 0.5)).toBeCloseTo(3);
    expect(model.heightAt(0.5, 1.5)).toBeCloseTo(4);
  });

  it('interpolates between the pixels', () => {
    expect(model.heightAt(1, 1)).toBeCloseTo(2.5);
  });

  it('returns null outside the tiles and wraps the longitude', () => {
    expect(model.heightAt(5, 1)).toBeNull();
    expect(model.heightAt(1, 361)).toBeCloseTo(model.heightAt(1, 1)!);
  });
});
