/** Returns month progress for the current month, or null for past/future months. */
export function budgetPacePercent(year: number, month: number, today = new Date()): number | null {
  if (year !== today.getFullYear() || month !== today.getMonth() + 1) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.min(100, Math.max(0, (today.getDate() / daysInMonth) * 100));
}

export function isSpendingAheadOfPace(spent: number, planned: number, pacePercent: number | null): boolean {
  return planned > 0 && pacePercent !== null && spent / planned * 100 > pacePercent;
}
