import type { CatalogSite } from '@/features/sites/types';

// Artemis candidate regions: the nine regions announced by NASA in October 2024
// (refined from the 13 regions of 2022), listed without priority.
//
// Coordinates:
//  • Apollo — landing sites (LROC), rounded to 0.01°; landing — the time of touchdown (UTC, NASA mission reports).
//  • Commercial and other countries' landings — the lander's position from LROC images or the
//    operators (NSSDC, LROC, CNSA, ISRO, JAXA); landing — the reported time of touchdown, UTC.
//    Luna 9 was never imaged from orbit, so its point is approximate.
//  • Nobile Rim 2 — a point from scientific publications.
//  • Mons Mouton — the summit per the IAU gazetteer; Mons Mouton Plateau — the center of the
//    LROC NAC mosaic of the region.
//  • Other regions (approximate: true) — the CENTER of the crater or region per publications.
//    NASA has not published exact points: it will pick sites inside the regions once the
//    launch dates are known. Illumination near the pole changes a lot over a few kilometers,
//    so the result for these regions is an estimate.
export const siteCatalog: CatalogSite[] = [
  {
    id: 'peak-near-cabeus-b',
    name: 'Peak near Cabeus B',
    group: 'clps',
    coordinates: { lat: -84.9, lon: -35.5, approximate: true },
  },
  {
    id: 'haworth',
    name: 'Haworth',
    group: 'clps',
    coordinates: { lat: -86.9, lon: -4.0, approximate: true },
  },
  {
    id: 'malapert-massif',
    name: 'Malapert Massif',
    group: 'clps',
    coordinates: { lat: -86.0, lon: 0.0, approximate: true },
  },
  {
    id: 'mons-mouton-plateau',
    name: 'Mons Mouton Plateau',
    group: 'clps',
    coordinates: { lat: -84.3, lon: 30.6, approximate: true },
  },
  {
    id: 'mons-mouton',
    name: 'Mons Mouton',
    group: 'clps',
    coordinates: { lat: -84.6, lon: 31.0, approximate: true },
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
    id: 'de-gerlache-rim-2',
    name: 'de Gerlache Rim 2',
    group: 'clps',
    coordinates: { lat: -88.5, lon: -87.1, approximate: true },
  },
  {
    id: 'slater-plain',
    name: 'Slater Plain',
    group: 'clps',
    coordinates: { lat: -88.08, lon: 111.29, approximate: true },
  },

  {
    id: 'im-1',
    name: 'IM-1 Odysseus — Malapert A',
    group: 'commercial',
    coordinates: { lat: -80.13, lon: 1.44 },
    landing: '2024-02-22T23:23:00Z',
  },
  {
    id: 'blue-ghost-1',
    name: 'Blue Ghost 1 — Mare Crisium',
    group: 'commercial',
    coordinates: { lat: 18.56, lon: 61.81 },
    landing: '2025-03-02T08:34:00Z',
  },
  {
    id: 'im-2',
    name: 'IM-2 Athena — Mons Mouton',
    group: 'commercial',
    coordinates: { lat: -84.7906, lon: 29.1957 },
    landing: '2025-03-06T17:28:50Z',
  },

  {
    id: 'chandrayaan-3',
    name: 'Chandrayaan-3 — Shiv Shakti Point',
    group: 'international',
    coordinates: { lat: -69.373, lon: 32.319 },
    landing: '2023-08-23T12:33:00Z',
  },
  {
    id: 'slim',
    name: 'SLIM — Shioli crater',
    group: 'international',
    coordinates: { lat: -13.316, lon: 25.251 },
    landing: '2024-01-19T15:20:00Z',
  },
  {
    id: 'change-3',
    name: "Chang'e 3 — Mare Imbrium",
    group: 'international',
    coordinates: { lat: 44.1214, lon: -19.5117 },
    landing: '2013-12-14T13:11:18Z',
  },
  {
    id: 'change-4',
    name: "Chang'e 4 — Von Kármán (far side)",
    group: 'international',
    coordinates: { lat: -45.4446, lon: 177.5991 },
    landing: '2019-01-03T02:26:00Z',
  },
  {
    id: 'change-5',
    name: "Chang'e 5 — Mons Rümker",
    group: 'international',
    coordinates: { lat: 43.0576, lon: -51.9161 },
    landing: '2020-12-01T15:11:00Z',
  },
  {
    id: 'change-6',
    name: "Chang'e 6 — Apollo basin (far side)",
    group: 'international',
    coordinates: { lat: -41.6384, lon: -153.9855 },
    landing: '2024-06-01T22:23:00Z',
  },
  {
    id: 'luna-9',
    name: 'Luna 9 — Oceanus Procellarum',
    group: 'international',
    coordinates: { lat: 7.08, lon: -64.37, approximate: true },
    landing: '1966-02-03T18:45:30Z',
  },
  {
    id: 'luna-17',
    name: 'Luna 17 / Lunokhod 1 — Mare Imbrium',
    group: 'international',
    coordinates: { lat: 38.3282, lon: -34.998 },
    landing: '1970-11-17T03:47:00Z',
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
