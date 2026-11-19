import { isValidMonth } from "./validation";

export const MAX_REVIEW_ENTRIES = 1000;
export const MAX_REVIEW_CATEGORIES = 200;
export const MAX_REVIEW_BYTES = 180_000;
export type SpendingCategory = { year: number; month: number; categoryName: string; planned: number; actual: number };
export type SpendingTransaction = { categoryName: string; merchant: string; amount: number; date: string };
export type SpendingSnapshot = { start: string; end: string; monthsRequested: number; monthsRecorded: number; categories: SpendingCategory[]; transactions: SpendingTransaction[] };

export function reviewWindow(year: number, month: number, monthsBack: number) {
  if (!isValidMonth(year, month) || !Number.isInteger(monthsBack) || monthsBack < 1 || monthsBack > 12) {
    throw new Error("Select a valid month and 1–12 prior months.");
  }
  const start = new Date(Date.UTC(year, month - 1 - monthsBack, 1));
  return { start: start.toISOString().slice(0, 10), end: `${year}-${String(month).padStart(2, "0")}-01`, startYear: start.getUTCFullYear(), startMonth: start.getUTCMonth() + 1 };
}

// Free-text ledger descriptions may contain more than a merchant. Remove common
// contact/account identifiers before allowing that text across the AI boundary.
export function reviewText(value: string): string {
  return value.replace(/https?:\/\/\S+|www\.\S+|\S+@\S+/gi, "[redacted]")
    .replace(/\b\d+\s+[^,;]+\b(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/gi, "[redacted]")
    .replace(/\d(?:[\s().+/-]*\d){2,}/g, "[redacted]")
    .replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 100);
}

export function summarizeSpending(snapshot: SpendingSnapshot) {
  const total = snapshot.categories.reduce((sum, category) => sum + Math.round(category.actual * 100), 0) / 100;
  const planned = snapshot.categories.reduce((sum, category) => sum + Math.round(category.planned * 100), 0) / 100;
  return { total, planned, transactionCount: snapshot.transactions.length, monthsRequested: snapshot.monthsRequested, monthsRecorded: snapshot.monthsRecorded, start: snapshot.start, end: snapshot.end };
}

export type SpendingSummary = ReturnType<typeof summarizeSpending>;
export function analyzeSpending(snapshot: SpendingSnapshot) {
  const categories = new Map<string, { totalCents: number; months: Set<string> }>();
  const merchants = new Map<string, { totalCents: number; purchases: number; months: Set<string> }>();
  for (const category of snapshot.categories) {
    const item = categories.get(category.categoryName) ?? { totalCents: 0, months: new Set<string>() };
    item.totalCents += Math.round(category.actual * 100);
    item.months.add(`${category.year}-${category.month}`);
    categories.set(category.categoryName, item);
  }
  for (const transaction of snapshot.transactions) {
    if (!transaction.merchant || transaction.merchant.includes("[redacted]")) continue;
    const item = merchants.get(transaction.merchant) ?? { totalCents: 0, purchases: 0, months: new Set<string>() };
    item.totalCents += Math.round(transaction.amount * 100);
    item.purchases++;
    item.months.add(transaction.date.slice(0, 7));
    merchants.set(transaction.merchant, item);
  }
  return {
    categories: [...categories].map(([categoryName, item]) => ({ categoryName, total: item.totalCents / 100, monthsObserved: item.months.size, averagePerObservedMonth: Math.round(item.totalCents / item.months.size) / 100 }))
      .sort((a, b) => b.total - a.total).slice(0, 10),
    merchants: [...merchants].map(([merchant, item]) => ({ merchant, total: item.totalCents / 100, purchases: item.purchases, distinctPurchaseMonths: item.months.size }))
      .sort((a, b) => b.total - a.total).slice(0, 10),
  };
}
