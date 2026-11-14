import type { CatalogSite } from '@/features/sites/types';

// Координаты пока не заполнены — их добавим вместе с данными эфемерид и рельефа.
// Список CLPS / Artemis — это кандидаты региона Artemis III (NASA, 2022),
// сверьте с актуальным списком перед финальной версией.
export const siteCatalog: CatalogSite[] = [
  { id: 'malapert-massif', name: 'Malapert Massif', group: 'clps' },
  { id: 'nobile-rim-1', name: 'Nobile Rim 1', group: 'clps' },
  { id: 'nobile-rim-2', name: 'Nobile Rim 2', group: 'clps' },
  { id: 'haworth', name: 'Haworth', group: 'clps' },
  { id: 'faustini-rim-a', name: 'Faustini Rim A', group: 'clps' },
  { id: 'leibnitz-beta-plateau', name: 'Leibnitz Beta Plateau', group: 'clps' },
  { id: 'connecting-ridge', name: 'Connecting Ridge', group: 'clps' },
  { id: 'de-gerlache-rim-2', name: 'de Gerlache Rim 2', group: 'clps' },
  { id: 'peak-near-cabeus-b', name: 'Peak Near Cabeus B', group: 'clps' },
  { id: 'amundsen-rim', name: 'Amundsen Rim', group: 'clps' },
  { id: 'slater-plain', name: 'Slater Plain', group: 'clps' },

  { id: 'apollo-11', name: 'Apollo 11 — Tranquility Base', group: 'apollo' },
  { id: 'apollo-12', name: 'Apollo 12 — Ocean of Storms', group: 'apollo' },
  { id: 'apollo-14', name: 'Apollo 14 — Fra Mauro', group: 'apollo' },
  { id: 'apollo-15', name: 'Apollo 15 — Hadley–Apennine', group: 'apollo' },
  { id: 'apollo-16', name: 'Apollo 16 — Descartes', group: 'apollo' },
  { id: 'apollo-17', name: 'Apollo 17 — Taurus–Littrow', group: 'apollo' },
];
