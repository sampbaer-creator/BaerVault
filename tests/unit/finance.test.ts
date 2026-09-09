import assert from "node:assert/strict";
import { test } from "node:test";
import { upcomingPayments } from "../../lib/recurring";
import { isValidDate, isValidMonth } from "../../lib/validation";
import { createDashboardViewModel } from "../../features/dashboard/dashboardViewModel";
import { demoFinancialAccounts } from "../../lib/accounts";

test("date validation rejects impossible dates and out-of-range months", () => {
  assert.equal(isValidDate("2026-02-30"), false);
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2026-13-01"), false);
  assert.equal(isValidMonth(2026, 13), false);
  assert.equal(isValidMonth(2026, 9), true);
});

test("monthly payment prediction clamps month-end and requires repeated evidence", () => {
  const history = ["2025-11-30", "2025-12-31", "2026-01-31"].map((date, index) => ({ id: String(index), description: "Rent", amount: 1000, date, accountId: "checking" }));
  assert.deepEqual(upcomingPayments(history, "2026-02-01", "2026-02-28").map((p) => [p.date, p.amount, p.estimated]), [["2026-02-28", 1000, true]]);
  assert.equal(upcomingPayments(history.slice(1), "2026-02-01", "2026-02-28").length, 0);
  assert.equal(upcomingPayments(history, "2026-04-01", "2026-04-30").length, 0);
});

test("recorded payments prevent predicting a bill already paid this month", () => {
  const history = ["2026-06-15", "2026-07-15", "2026-08-15", "2026-09-14"].map((date, i) => ({ id: String(i), description: "Internet", amount: 80, date, accountId: "checking" }));
  assert.equal(upcomingPayments(history, "2026-09-15", "2026-09-30").length, 0);
});

test("net worth components preserve overdrafts and investment cost fallback", () => {
  const model = createDashboardViewModel({ month: "September", categories: [], incomeEntries: [] }, [{ id: "investment", name: "Brokerage", institution: "", type: "brokerage", owner: "joint", holdings: [{ id: "h", symbol: "VTI", name: "VTI", fallbackPrice: 0, lots: [{ id: "l", shares: 2, price: 100, date: "2026-01-01" }] }] }], [{ ...demoFinancialAccounts[0], balance: -50 }, { ...demoFinancialAccounts[3], balance: 100 }]);
  assert.equal(model.cashAssets, -50);
  assert.equal(model.debts, 100);
  assert.equal(model.accounts[0].holdings[0].fallbackPrice, 100);
  assert.equal(model.cashAssets + 2 * model.accounts[0].holdings[0].fallbackPrice - model.debts, 50);
});
