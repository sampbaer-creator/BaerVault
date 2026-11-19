import assert from "node:assert/strict";
import { test } from "node:test";

import { findAdviceTarget, resolveAdviceCategories, normalizeBudgetAdvice } from "@/lib/helpers/budgetAdvice";

test("budget advice deduplicates exact category names and forces low confidence with short history", () => {
  const advice = normalizeBudgetAdvice({
    suggestions: [
      { categoryName: "Groceries", suggestedAmount: 400, rationale: "Recent average" },
      { categoryName: "Groceries", suggestedAmount: 425, rationale: "Duplicate" },
      { categoryName: "Gas", suggestedAmount: 100, rationale: "Recent average" },
    ],
    overallTip: "Keep a small buffer.",
    confidence: "high",
  }, 2);

  assert.equal(advice.confidence, "low");
  assert.deepEqual(advice.suggestions.map((suggestion) => suggestion.categoryName), ["Groceries", "Gas"]);
});

test("existing category IDs restore exact numeric names and ignore misleading AI labels", () => {
  const names = new Map([["category_1", "Fund 123"], ["category_2", "Fund 456"], ["category_3", "Fund [redacted]"]]);
  const advice = { suggestions: [
    { categoryId: "category_2", isNewCategory: false, categoryName: "Fund [redacted]", suggestedAmount: 20, rationale: "Average" },
    { categoryId: "category_1", isNewCategory: false, categoryName: "Fund 456", suggestedAmount: 10, rationale: "Average" },
  ], overallTip: "Tip", confidence: "high" as const };
  const resolved = normalizeBudgetAdvice(resolveAdviceCategories(advice, names), 3);
  assert.deepEqual(resolved.suggestions.map(row => row.categoryName), ["Fund 456", "Fund 123"]);
  const categories = [{ id: "a", name: "Fund 123" }, { id: "b", name: "Fund 456" }, { id: "c", name: "Fund [redacted]" }];
  assert.equal(findAdviceTarget(categories, resolved.suggestions[0])?.id, "b");
  assert.equal(findAdviceTarget(categories, resolved.suggestions[1])?.id, "a");
});

test("unknown, missing, contradictory, duplicate and ambiguous identities fail closed", () => {
  const names = new Map([["category_1", "Fund 123"]]);
  const suggestion = { categoryId: "category_1" as string | null, isNewCategory: false, categoryName: "Fund [redacted]", suggestedAmount: 10, rationale: "Average" };
  const resolve = (suggestions = [suggestion], mapping = names) => resolveAdviceCategories({ suggestions, overallTip: "Tip", confidence: "high" }, mapping);
  assert.throws(() => resolve([{ ...suggestion, categoryId: "unknown" }]));
  assert.throws(() => resolve([{ ...suggestion, categoryId: null }]));
  assert.throws(() => resolve([{ ...suggestion, isNewCategory: true }]));
  assert.throws(() => resolve([suggestion, suggestion]));
  assert.throws(() => resolve([suggestion], new Map([["category_1", "Fund 123"], ["category_2", "Fund 123"]])));
  for (const categoryName of ["Fund 123", " fund 123 ", "Fund [redacted]"]) {
    assert.throws(() => resolve([{ ...suggestion, categoryId: null, isNewCategory: true, categoryName }]));
  }
  assert.equal(resolve([{ ...suggestion, categoryId: null, isNewCategory: true, categoryName: "Travel" }]).suggestions[0].categoryName, "Travel");
  assert.throws(() => findAdviceTarget([{ name: "food" }], { categoryName: "Food" }));
  assert.throws(() => findAdviceTarget([{ name: "Food" }, { name: "Food" }], { categoryName: "Food" }));
  assert.throws(() => findAdviceTarget([{ name: "Travel" }], { categoryName: "Travel", isNewCategory: true }));
  assert.equal(findAdviceTarget([{ name: "Food" }], { categoryName: "Travel", isNewCategory: true }), undefined);
});
