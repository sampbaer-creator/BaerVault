import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { forecastBudget, forecastMonthTotals } from "@/lib/helpers/budgetForecast";
import { findAdviceTarget } from "@/lib/helpers/budgetAdvice";
import type { SpendingSnapshot } from "@/lib/helpers/spendingReview";

function snapshot(months = [1, 2, 3], source: "ledger" | "bank" = "ledger"): SpendingSnapshot {
  return { source, start: "2025-01-01", end: "2026-01-01", monthsRequested: 12, monthsRecorded: months.length,
    categories: months.map(month => ({ year: 2025, month, categoryId: "bank_category_12345678", categoryName: "Food", actual: month * 100, planned: 100 })),
    transactions: months.map(month => ({ categoryId: "bank_category_12345678", categoryName: "Food", merchant: "Market", amount: month * 100, date: `2025-${String(month).padStart(2, "0")}-01` })) };
}
const names = new Map([["bank_category_12345678", "FOOD_AND_DRINK_GROCERIES"]]);
test("forecast blends median and capped recency weighted average in cents", () => {
  const result = forecastMonthTotals([10000, 20000, 30000]);
  assert.equal(result.medianCents, 20000);
  assert.equal(result.weightedCents, 23333);
  assert.equal(result.buffer, .1);
  assert.equal(result.suggestedCents, 23800);
  assert.equal(forecastMonthTotals([1234]).suggestedCents, 1200);
  assert.equal(forecastMonthTotals([0, 0, 900000]).suggestedCents, 0);
  assert.ok(forecastMonthTotals([10000, 10000, 99999999]).suggestedCents <= 15000);
  for (const values of [[], [-1], [Infinity], [NaN], [1.5]]) assert.throws(() => forecastMonthTotals(values));
});
test("unknown months are omitted; confidence is low for short category history", () => {
  const history = snapshot([1, 12]);
  const result = forecastBudget(history, names);
  assert.equal(result.confidence, "low");
  assert.equal(result.suggestions[0].suggestedAmount, forecastMonthTotals([10000, 120000]).suggestedCents / 100);
  assert.match(result.suggestions[0].rationale, /2 observed months \(2025-01, 2025-12\)/);
  assert.match(result.insights!.join(" "), /2 distinct months/);
});
test("3, 6 and 12 months are deterministic and finite with exact ledger identity", () => {
  for (const count of [3, 6, 12]) {
    const history = snapshot(Array.from({ length: count }, (_, i) => i + 1));
    const result = forecastBudget(history, names);
    assert.deepEqual(result, forecastBudget(history, names));
    assert.equal(result.suggestions[0].categoryName, names.values().next().value);
    assert.equal(result.suggestions[0].isNewCategory, false);
    assert.ok(Number.isFinite(result.suggestions[0].suggestedAmount));
    assert.match(result.suggestions[0].rationale, new RegExp(`${count} observed months`));
  }
});
test("bank forecasts propose readable names without matching unrelated ledger categories", () => {
  const result = forecastBudget(snapshot([1, 2, 3], "bank"), names);
  const suggestion = result.suggestions[0];
  assert.equal(suggestion.isNewCategory, true);
  assert.match(suggestion.categoryName, /^Bank estimate: Food And Drink Groceries/);
  assert.equal(findAdviceTarget([{ name: "Groceries" }, { name: "FOOD_AND_DRINK_GROCERIES" }], suggestion), undefined);
  assert.throws(() => findAdviceTarget([{ name: suggestion.categoryName }], suggestion));
  assert.match(result.overallTip, /Bank estimates/);
});
test("review path has no external model transport or key dependency and retains source separation", () => {
  const action = readFileSync("features/budgets/budgetAdviceActions.ts", "utf8");
  const forecast = readFileSync("lib/helpers/budgetForecast.ts", "utf8");
  assert.doesNotMatch(action + forecast, /@ai-sdk|generateObject|OPENAI_API_KEY|OPEN_API_KEY|fetch\(|https?:|weft/i);
  assert.match(action, /forecastBudget\(history, categoryNames\)/);
  assert.match(action, /source === "bank" \? getBankSpendingSnapshot : getSpendingSnapshot/);
  const ui = readFileSync("features/budgets/BudgetsWorkspace.tsx", "utf8");
  const css = readFileSync("features/budgets/BudgetsWorkspace.module.css", "utf8");
  assert.match(ui, /statistical estimates, no data sent to OpenAI/);
  assert.doesNotMatch(ui, /AI budget|AI-generated|with OpenAI/);
  assert.match(css, /\.reviewControls[^}]*flex-wrap: wrap/);
  assert.match(css, /@media \(max-width: 47\.999rem\) \{\s*\.reviewControls \{ flex-direction: column/);
  assert.match(css, /\.adviceSuggestionAction button \{ min-height: 44px/);
});

test("bounded anomaly insight requires category evidence and never invents recurring merchants", () => {
  const history = snapshot([1]);
  history.transactions = [10, 10, 100].map((amount, index) => ({ categoryId: "bank_category_12345678", categoryName: "Food", merchant: "Market", amount, date: `2025-01-0${index + 1}` }));
  const result = forecastBudget(history, names);
  assert.equal(result.insights!.filter(value => value.includes("exceeds 3x")).length, 1);
  assert.ok(!result.insights!.some(value => value.includes("distinct months")));
  const bank = forecastBudget(snapshot([1], "bank"), new Map([["bank_category_12345678", "x".repeat(100)]]));
  assert.ok(bank.suggestions[0].categoryName.length <= 80);
});
