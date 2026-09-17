export type MonthSelection = { year: number; month: number };

const MIN_YEAR = 2000;
const MAX_YEAR = 2200;

export function currentMonth(date = new Date()): MonthSelection {
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function parseMonthSelection(
  yearValue: string | string[] | null | undefined,
  monthValue: string | string[] | null | undefined,
  fallback = currentMonth(),
): MonthSelection {
  const year = Number(Array.isArray(yearValue) ? yearValue[0] : yearValue);
  const month = Number(Array.isArray(monthValue) ? monthValue[0] : monthValue);
  return {
    year: Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR ? year : fallback.year,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : fallback.month,
  };
}

export function parseExplicitMonthSelection(
  yearValue: string | string[] | null | undefined,
  monthValue: string | string[] | null | undefined,
): MonthSelection | undefined {
  const invalid = { year: Number.NaN, month: Number.NaN };
  const parsed = parseMonthSelection(yearValue, monthValue, invalid);
  return Number.isInteger(parsed.year) && Number.isInteger(parsed.month) ? parsed : undefined;
}

export function offsetMonth(selection: MonthSelection, offset: number): MonthSelection {
  const target = new Date(Date.UTC(selection.year, selection.month - 1 + offset, 1));
  return { year: target.getUTCFullYear(), month: target.getUTCMonth() + 1 };
}

export function monthQuery(selection: MonthSelection) {
  return `year=${selection.year}&month=${selection.month}`;
}

export function withMonth(href: string, selection: MonthSelection) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}${monthQuery(selection)}`;
}
