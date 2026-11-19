import type { BudgetAdvice } from "./budgetAdvice";
import { resolveAdviceCategories } from "./budgetAdvice";
import { analyzeSpending, reviewText, summarizeSpending, type SpendingSnapshot } from "./spendingReview";

const MAX_CENTS = 99_999_999_999_900;
const cents = (value: number) => {
  const result = Math.round(value * 100);
  if (!Number.isSafeInteger(result) || result < 0 || result > MAX_CENTS) throw new Error("Invalid spending amount.");
  return result;
};
export function median(values: number[]): number {
  if (!values.length) throw new Error("No observed months.");
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// Values are chronological integer cents. Unknown months never enter this array.
export function forecastMonthTotals(values: number[]) {
  if (!values.length || values.length > 12 || values.some(v => !Number.isSafeInteger(v) || v < 0 || v > MAX_CENTS)) throw new Error("Invalid observed month totals.");
  const middle = median(values);
  // Winsorize at twice the median so one unusually large month cannot dominate.
  const weighted = Math.round(values.reduce((sum, value, index) => sum + Math.min(value, middle * 2) * (index + 1), 0) / (values.length * (values.length + 1) / 2));
  const base = Math.round((middle + weighted) / 2);
  const buffer = middle > 0 ? Math.min(.1, median(values.map(v => Math.abs(v - middle))) / middle) : 0;
  const buffered = Math.round(base * (1 + buffer));
  // Round to whole currency units, constrained to 50%-150% of the median.
  const suggestedCents = Math.min(MAX_CENTS, Math.max(Math.ceil(middle * .5), Math.min(Math.floor(middle * 1.5), Math.round(buffered / 100) * 100)));
  return { medianCents: middle, weightedCents: weighted, buffer, suggestedCents };
}

export function forecastBudget(history: SpendingSnapshot, categoryNames: ReadonlyMap<string, string>): BudgetAdvice {
  const groups = new Map<string, Map<string, number>>();
  for (const row of history.categories) {
    const months = groups.get(row.categoryId) ?? new Map<string, number>();
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    const total = (months.get(key) ?? 0) + cents(row.actual);
    if (!Number.isSafeInteger(total) || total > MAX_CENTS) throw new Error("Invalid spending total.");
    months.set(key, total);
    groups.set(row.categoryId, months);
  }
  const bank = history.source === "bank";
  const suggestions = [...groups].slice(0, 20).map(([id, months]) => {
    const original = categoryNames.get(id);
    if (original === undefined) throw new Error("Unrecognized category identity.");
    const observed = [...months].sort(([a], [b]) => a.localeCompare(b));
    const result = forecastMonthTotals(observed.map(([, value]) => value));
    // Provider namespace is explicit; never infer ledger identity from its label.
    const label = reviewText(original).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    return { categoryId: bank ? null : id, isNewCategory: bank, categoryName: bank ? `Bank estimate: ${label.slice(0, 54)} (${id.slice(-8)})` : original,
      suggestedAmount: result.suggestedCents / 100,
      rationale: `${observed.length} observed months (${observed.map(([key]) => key).join(", ")}). Median ${(result.medianCents / 100).toFixed(2)}; recency weights 1..${observed.length}, totals capped at 2x median: ${(result.weightedCents / 100).toFixed(2)}. Equal blend + ${(result.buffer * 100).toFixed(1)}% volatility buffer; whole-unit rounding, capped at 50%-150% of median.` };
  });
  const analysis = analyzeSpending(history);
  const insights: string[] = [];
  const top = analysis.categories[0];
  if (top) insights.push(`Largest observed category: ${top.categoryName}, ${top.total.toFixed(2)} across ${top.monthsObserved} recorded months.`);
  const totals = new Map<string, number>();
  for (const row of history.categories) {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    totals.set(key, (totals.get(key) ?? 0) + cents(row.actual));
  }
  const ordered = [...totals].sort(([a], [b]) => a.localeCompare(b));
  if (ordered.length >= 2) {
    const [before, latest] = ordered.slice(-2);
    insights.push(`Recorded spending changed by ${((latest[1] - before[1]) / 100).toFixed(2)} from ${before[0]} to ${latest[0]}; coverage may differ.`);
  }
  const repeated = analysis.merchants.find(row => row.distinctPurchaseMonths >= 2);
  if (repeated) insights.push(`${repeated.merchant} appears in ${repeated.distinctPurchaseMonths} distinct months; likely repeated spending, not a verified subscription.`);
  for (const transaction of history.transactions) {
    const amounts = history.transactions.filter(t => t.categoryId === transaction.categoryId && Number.isFinite(t.amount) && t.amount > 0).map(t => cents(t.amount));
    if (amounts.length < 3) continue;
    const typical = median(amounts);
    if (typical > 0 && cents(transaction.amount) > typical * 3) {
      insights.push(`One ${transaction.categoryName} purchase of ${transaction.amount.toFixed(2)} exceeds 3x the category purchase median of ${(typical / 100).toFixed(2)}. Check whether it is exceptional.`);
      break;
    }
  }
  const confidence = history.monthsRecorded < 3 || [...groups.values()].some(g => g.size < 3) ? "low" : history.monthsRecorded >= 6 ? "high" : "medium";
  return { ...resolveAdviceCategories({ suggestions, insights, confidence, overallTip: `${bank ? "Bank estimates exclude identified transfers and card payments; provider classification can be incomplete. Proposed categories require individual approval. " : "Ledger purchases only. "}Statistical estimates use observed months, not missing-month zeros. Confidence describes history coverage, not predictive accuracy. Review each amount; no income or affordability is inferred.` }, categoryNames), review: summarizeSpending(history) };
}
