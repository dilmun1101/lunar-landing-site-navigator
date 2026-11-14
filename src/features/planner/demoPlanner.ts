// ДЕМО-ДАННЫЕ: значения псевдослучайные (синусоиды), расчёты не подключены.

export type PlannerMetric = 'sunlight' | 'comms';

export interface PlannerSite {
  id: string;
  name: string;
}

export const demoPlannerSites: PlannerSite[] = [
  { id: 'malapert-massif', name: 'Malapert Massif' },
  { id: 'nobile-rim-1', name: 'Nobile Rim 1' },
  { id: 'shackleton-rim', name: 'Shackleton Rim' },
  { id: 'de-gerlache-rim', name: 'de Gerlache Rim' },
  { id: 'connecting-ridge', name: 'Connecting Ridge' },
  { id: 'apollo-11', name: 'Apollo 11' },
  { id: 'apollo-15', name: 'Apollo 15' },
  { id: 'apollo-17', name: 'Apollo 17' },
];

const START = Date.UTC(2026, 10, 14);
const STEP_DAYS = 14;
const COLUMNS = 26;

export const demoPlannerDates: Date[] = Array.from(
  { length: COLUMNS },
  (_, index) => new Date(START + index * STEP_DAYS * 86_400_000)
);

const clamp = (value: number) => Math.round(Math.min(98, Math.max(4, value)));

/** values[metric][siteIndex][dateIndex] — проценты 0–100 */
export const demoPlannerValues: Record<PlannerMetric, number[][]> = {
  sunlight: demoPlannerSites.map((_, row) =>
    demoPlannerDates.map((_, col) => {
      const day = col * STEP_DAYS;
      return clamp(
        55 +
          38 * Math.sin((2 * Math.PI * day) / 29.53 + row * 0.9) +
          8 * Math.sin(day / 40 + row)
      );
    })
  ),
  comms: demoPlannerSites.map((_, row) =>
    demoPlannerDates.map((_, col) => {
      const day = col * STEP_DAYS;
      return clamp(
        50 +
          40 * Math.sin((2 * Math.PI * day) / 27.32 + row * 1.7 + 1) +
          6 * Math.cos(day / 33 + row)
      );
    })
  ),
};
