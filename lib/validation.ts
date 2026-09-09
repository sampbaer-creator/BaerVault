export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function isValidMonth(year: number, month: number): boolean {
  return Number.isInteger(year) && year >= 1900 && year <= 2200 && Number.isInteger(month) && month >= 1 && month <= 12;
}
