import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeBudgetAdvice } from "@/lib/helpers/budgetAdvice";

test("budget advice deduplicates category names and forces low confidence with short history", () => {
  const advice = normalizeBudgetAdvice({
    suggestions: [
      { categoryName: "Groceries", suggestedAmount: 400, rationale: "Recent average" },
      { categoryName: " groceries ", suggestedAmount: 425, rationale: "Duplicate" },
      { categoryName: "Gas", suggestedAmount: 100, rationale: "Recent average" },
    ],
    overallTip: "Keep a small buffer.",
    confidence: "high",
  }, 2);

  assert.equal(advice.confidence, "low");
  assert.deepEqual(advice.suggestions.map((suggestion) => suggestion.categoryName), ["Groceries", "Gas"]);
});
