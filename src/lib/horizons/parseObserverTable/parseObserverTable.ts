const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export interface ObserverTable {
  /** Sample times, ms UTC */
  times: number[];
  az: number[];
  el: number[];
}

/**
 * Parses a Horizons observer table (CSV, QUANTITIES=4) between $$SOE and $$EOE.
 * Row: " 2026-Nov-14 00:00,*, , 126.627333,     1.258335,"
 */
export function parseObserverTable(text: string): ObserverTable {
  const start = text.indexOf('$$SOE');
  const end = text.indexOf('$$EOE');
  if (start === -1 || end === -1) {
    throw new Error('Horizons: no $$SOE…$$EOE block in the response');
  }

  const table: ObserverTable = { times: [], az: [], el: [] };
  for (const raw of text.slice(start + 5, end).split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const fields = line.split(',').map((field) => field.trim());
    const match = /^(\d{4})-([A-Za-z]{3})-(\d{2}) (\d{2}):(\d{2})/.exec(
      fields[0] ?? ''
    );
    if (!match) throw new Error(`Horizons: could not parse the time: ${line}`);
    // Azimuth and elevation are the last two numeric fields
    const numbers = fields.slice(1).filter((field) => /^-?\d/.test(field));
    const [azimuth = Number.NaN, elevation = Number.NaN] = numbers
      .slice(-2)
      .map(Number);
    if (!Number.isFinite(azimuth) || !Number.isFinite(elevation)) {
      throw new Error(`Horizons: could not parse the angles: ${line}`);
    }
    const [, year = '', month = '', day = '', hour = '', minute = ''] = match;
    const monthIndex = MONTHS[month];
    if (monthIndex === undefined) {
      throw new Error(`Horizons: could not parse the time: ${line}`);
    }
    table.times.push(Date.UTC(+year, monthIndex, +day, +hour, +minute));
    table.az.push(azimuth);
    table.el.push(elevation);
  }
  return table;
}
