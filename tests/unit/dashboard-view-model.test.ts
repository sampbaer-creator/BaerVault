import assert from "node:assert/strict";
import test from "node:test";
import { createDashboardViewModel, daysLeftInMonth, spendingStatus } from "../../features/dashboard/dashboardViewModel";

test("days left includes today and handles month boundaries", () => {
  assert.equal(daysLeftInMonth(2026, 2, new Date(2026, 1, 27)), 2);
  assert.equal(daysLeftInMonth(2026, 2, new Date(2026, 2, 1)), 0);
  assert.equal(daysLeftInMonth(2026, 3, new Date(2026, 1, 27)), 31);
});

test("budget status changes at ten percent remaining and above plan", () => {
  assert.equal(spendingStatus(100, 89), "on-track");
  assert.equal(spendingStatus(100, 90), "close");
  assert.equal(spendingStatus(100, 101), "over");
});

test("home view model derives the amount left from planned spending", () => {
  const budget = { month: "February 2026", incomeEntries: [], categories: [{ id: "food", name: "Food", plannedAmount: 200, purchases: [{ id: "one", amount: 45, description: "Groceries", date: "2026-02-27" }] }] };
  const model = createDashboardViewModel(budget, [], [], [], [], { year: 2026, month: 2, today: new Date(2026, 1, 27) });
  assert.equal(model.leftToSpend, 155);
  assert.equal(model.daysLeft, 2);
  assert.equal(model.budgetStatus, "on-track");
});
