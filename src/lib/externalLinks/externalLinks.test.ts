import { describe, expect, it } from 'vitest';
import {
  coordinatesForSearch,
  externalLinks,
  formatCoordinates,
} from '@/lib/externalLinks/externalLinks';

describe('formatCoordinates', () => {
  it('writes hemispheres in English', () => {
    expect(formatCoordinates({ lat: -89.9, lon: 0 }, 'en')).toBe(
      '89.90° S, 0.00° E'
    );
    expect(formatCoordinates({ lat: 0.67, lon: -23.47 }, 'en')).toBe(
      '0.67° N, 23.47° W'
    );
  });

  it('writes hemispheres in Russian', () => {
    expect(formatCoordinates({ lat: -89.9, lon: 129.78 }, 'ru')).toBe(
      '89.90° ю. ш., 129.78° в. д.'
    );
    expect(formatCoordinates({ lat: 0.67, lon: -23.47 }, 'ru-RU')).toBe(
      '0.67° с. ш., 23.47° з. д.'
    );
  });
});

describe('coordinatesForSearch', () => {
  it('keeps signs and uses a dot', () => {
    expect(coordinatesForSearch({ lat: -89.9, lon: -12.345 })).toBe(
      '-89.90, -12.35'
    );
  });
});

describe('externalLinks', () => {
  it('uses https', () => {
    for (const url of Object.values(externalLinks)) {
      expect(url.startsWith('https://')).toBe(true);
    }
  });
});
