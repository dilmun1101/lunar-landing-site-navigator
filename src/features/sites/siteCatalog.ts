import type { CatalogSite } from '@/features/sites/types';

// CLPS / Artemis list: Artemis III candidate regions (NASA, 2022),
// check against the current list before the final version.
//
// Coordinates:
//  • Apollo — landing sites (LROC), rounded to 0.01°; landing — the time of touchdown (UTC, NASA mission reports).
//  • Connecting Ridge, Nobile Rim 2 — points from scientific publications.
//  • Other south polar regions (approximate: true) — the CENTER of the crater or region
//    per Wikipedia/publications. A position on the crater rim differs by kilometers,
//    and illumination near the pole changes a lot over such distances, so before
//    the final version replace them with exact points from NASA data.
//  • Leibnitz Beta Plateau — coordinates not found, no data is calculated for it.
export const siteCatalog: CatalogSite[] = [
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    group: 'clps',
    coordinates: { lat: -86.0, lon: 0.0, approximate: true },
  },
  {
    id: 'nobile-rim-1',
    name: 'Nobile Rim 1',
    group: 'clps',
    coordinates: { lat: -85.3, lon: 31.0, approximate: true },
  },
  {
    id: 'nobile-rim-2',
    name: 'Nobile Rim 2',
    group: 'clps',
    coordinates: { lat: -84.20156, lon: 60.69989 },
  },
  {
    id: 'haworth',
    name: 'Haworth',
    group: 'clps',
    coordinates: { lat: -86.9, lon: -4.0, approximate: true },
  },
  {
    id: 'faustini-rim-a',
    name: 'Faustini Rim A',
    group: 'clps',
    coordinates: { lat: -87.3, lon: 77.0, approximate: true },
  },
  { id: 'leibnitz-beta-plateau', name: 'Leibnitz Beta Plateau', group: 'clps' },
  {
    id: 'connecting-ridge',
    name: 'Connecting Ridge',
    group: 'clps',
    coordinates: { lat: -89.527, lon: -154.592 },
  },
  {
    id: 'de-gerlache-rim-2',
    name: 'de Gerlache Rim 2',
    group: 'clps',
    coordinates: { lat: -88.5, lon: -87.1, approximate: true },
  },
  {
    id: 'peak-near-cabeus-b',
    name: 'Peak Near Cabeus B',
    group: 'clps',
    coordinates: { lat: -84.9, lon: -35.5, approximate: true },
  },
  {
    id: 'amundsen-rim',
    name: 'Amundsen Rim',
    group: 'clps',
    coordinates: { lat: -84.25, lon: 68.6, approximate: true },
  },
  {
    id: 'slater-plain',
    name: 'Slater Plain',
    group: 'clps',
    coordinates: { lat: -88.08, lon: 111.29, approximate: true },
  },

  {
    id: 'apollo-11',
    name: 'Apollo 11 — Tranquility Base',
    group: 'apollo',
    coordinates: { lat: 0.67, lon: 23.47 },
    landing: '1969-07-20T20:17:40Z',
  },
  {
    id: 'apollo-12',
    name: 'Apollo 12 — Ocean of Storms',
    group: 'apollo',
    coordinates: { lat: -3.01, lon: -23.42 },
    landing: '1969-11-19T06:54:35Z',
  },
  {
    id: 'apollo-14',
    name: 'Apollo 14 — Fra Mauro',
    group: 'apollo',
    coordinates: { lat: -3.65, lon: -17.47 },
    landing: '1971-02-05T09:18:11Z',
  },
  {
    id: 'apollo-15',
    name: 'Apollo 15 — Hadley–Apennine',
    group: 'apollo',
    coordinates: { lat: 26.13, lon: 3.63 },
    landing: '1971-07-30T22:16:29Z',
  },
  {
    id: 'apollo-16',
    name: 'Apollo 16 — Descartes',
    group: 'apollo',
    coordinates: { lat: -8.97, lon: 15.5 },
    landing: '1972-04-21T02:23:35Z',
  },
  {
    id: 'apollo-17',
    name: 'Apollo 17 — Taurus–Littrow',
    group: 'apollo',
    coordinates: { lat: 20.19, lon: 30.77 },
    landing: '1972-12-11T19:54:57Z',
  },
];
