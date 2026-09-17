export type PaymentHistory = { id: string; description: string; amount: number; date: string; accountId: string | null };
export type UpcomingPayment = { id: string; name: string; amount: number; date: string; estimated: boolean };

/** Infer monthly bills only from three distinct months of similar payments. */
export function upcomingPayments(history: PaymentHistory[], from: string, through: string): UpcomingPayment[] {
  const groups = new Map<string, PaymentHistory[]>();
  for (const payment of history) {
    if (payment.date >= from || payment.amount <= 0) continue;
    const key = `${payment.accountId ?? "manual"}:${payment.description.trim().toLowerCase().replace(/\s+/g, " ")}`;
    groups.set(key, [...(groups.get(key) ?? []), payment]);
  }
  const result: UpcomingPayment[] = history.filter((p) => p.date >= from && p.date <= through)
    .map((p) => ({ id: p.id, name: p.description, amount: p.amount, date: p.date, estimated: false }));
  for (const [key, values] of groups) {
    const ordered = values.toSorted((a, b) => b.date.localeCompare(a.date));
    const recent = ordered.slice(0, 3);
    if (recent.length < 3 || new Set(recent.map((p) => p.date.slice(0, 7))).size !== 3) continue;
    const latest = recent[0];
    const monthNumber = (date: string) => Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7));
    if (monthNumber(recent[0].date) - monthNumber(recent[2].date) !== 2) continue;
    if (recent.some((p) => Math.abs(p.amount - latest.amount) > Math.max(1, latest.amount * .1))) continue;
    const days = recent.map((p) => Number(p.date.slice(8, 10)));
    if (Math.max(...days) - Math.min(...days) > 4) continue;
    const year = Number(from.slice(0, 4)), month = Number(from.slice(5, 7));
    if (monthNumber(from) - monthNumber(latest.date) !== 1) continue;
    const day = Math.min(Math.max(...days), new Date(Date.UTC(year, month, 0)).getUTCDate());
    const date = `${from.slice(0, 7)}-${String(day).padStart(2, "0")}`;
    if (date < from || date > through) continue;
    if (result.some((p) => p.name.trim().toLowerCase() === latest.description.trim().toLowerCase() && p.date === date)) continue;
    result.push({ id: key, name: latest.description, amount: latest.amount, date, estimated: true });
  }
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
