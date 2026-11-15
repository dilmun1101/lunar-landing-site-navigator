const pad = (value: number) => String(value).padStart(2, '0');

/**
 * Date → UTC string. The format depends on the language:
 * ru — `14.11.2026 12:00`, others — `2026-11-14 12:00`.
 */
export function formatUtcDateTime(date: Date, language: string): string {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;

  return language.startsWith('ru')
    ? `${day}.${month}.${year} ${time}`
    : `${year}-${month}-${day} ${time}`;
}

const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/;
const RU_DATE_TIME = /^(\d{2})\.(\d{2})\.(\d{4})[ T](\d{2}):(\d{2})$/;

function buildUtcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Reject Feb 31, hour 25, etc.: the components must match after the Date is built.
  const isSame =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute;

  return isSame ? date : null;
}

/**
 * UTC string → Date. Accepts both formats (ISO `YYYY-MM-DD HH:MM` and
 * Russian `DD.MM.YYYY HH:MM`) regardless of the language. Invalid value → null.
 */
export function parseUtcDateTime(text: string): Date | null {
  const value = text.trim();

  const iso = ISO_DATE_TIME.exec(value);
  if (iso) {
    const [year, month, day, hour, minute] = iso.slice(1).map(Number);
    return buildUtcDate(year!, month!, day!, hour!, minute!);
  }

  const ru = RU_DATE_TIME.exec(value);
  if (ru) {
    const [day, month, year, hour, minute] = ru.slice(1).map(Number);
    return buildUtcDate(year!, month!, day!, hour!, minute!);
  }

  return null;
}
