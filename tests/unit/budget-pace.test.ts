import assert from "node:assert/strict";
import { test } from "node:test";
import { budgetPacePercent, isSpendingAheadOfPace } from "../../lib/helpers/budgetPace";

test("budget pace uses the current month and includes today", () => {
  assert.equal(budgetPacePercent(2026, 10, new Date(2026, 9, 1)), 1 / 31 * 100);
  assert.equal(budgetPacePercent(2026, 10, new Date(2026, 9, 31)), 100);
  assert.equal(budgetPacePercent(2026, 9, new Date(2026, 9, 15)), null);
});

test("budget pace handles leap-year February and ahead-of-pace spending", () => {
  assert.equal(budgetPacePercent(2024, 2, new Date(2024, 1, 15)), 15 / 29 * 100);
  assert.equal(isSpendingAheadOfPace(60, 100, 50), true);
  assert.equal(isSpendingAheadOfPace(50, 100, 50), false);
  assert.equal(isSpendingAheadOfPace(100, 0, 50), false);
});
