import assert from "node:assert/strict";
import { test } from "node:test";
import { readSpendingSnapshot } from "@/lib/data/spendingReviewQuery";
import { analyzeSpending, reviewText, reviewWindow, summarizeSpending } from "@/lib/helpers/spendingReview";

function fixture(responses: Array<{ data: unknown[]; count: number; error?: unknown }>) {
  const calls: Array<[string, ...unknown[]]> = [];
  const client = { from(table: string) {
    calls.push(["from", table]);
    const response = responses.shift();
    const chain = new Proxy({}, { get(_target, name) {
      if (name === "then") return (resolve: (value: unknown) => unknown) => Promise.resolve(response).then(resolve);
      return (...args: unknown[]) => { calls.push([String(name), ...args]); return chain; };
    } });
    return chain;
  } };
  return { client: client as unknown as Parameters<typeof readSpendingSnapshot>[0], calls };
}

test("calendar history crosses years and validates 1–12 prior months", () => {
  assert.deepEqual(reviewWindow(2026, 1, 2), { start: "2025-11-01", end: "2026-01-01", startYear: 2025, startMonth: 11 });
  assert.equal(reviewWindow(2026, 3, 12).start, "2025-03-01");
  for (const n of [0, 13, 1.5, NaN]) assert.throws(() => reviewWindow(2026, 3, n));
  assert.throws(() => reviewWindow(2026, 13, 1));
});

test("snapshot uses only household-scoped selects, calendar bounds and ledger purchases", async () => {
  const { client, calls } = fixture([
    { data: [{ id: "month", year: 2025, month: 12 }], count: 1 },
    { data: [{ id: "category", budget_month_id: "month", name: "Food", planned_amount: "100" }], count: 1 },
    { data: [{ budget_category_id: "category", description: "Market", amount: "12.30", entry_date: "2025-12-02" }, { budget_category_id: "category", description: "Market", amount: "0.10", entry_date: "2025-12-03" }], count: 2 },
  ]);
  const result = await readSpendingSnapshot(client, "household", 2026, 1, 2);
  assert.equal(result.categories[0].actual, 12.4);
  assert.equal(result.transactions[0].merchant, "Market");
  assert.deepEqual(summarizeSpending(result), { total: 12.4, planned: 100, transactionCount: 2, monthsRequested: 2, monthsRecorded: 1, start: "2025-11-01", end: "2026-01-01" });
  assert.deepEqual(calls.filter(c => c[0] === "from").map(c => c[1]), ["budget_months", "budget_categories", "budget_entries"]);
  assert.equal(calls.filter(c => c[0] === "eq" && c[1] === "household_id" && c[2] === "household").length, 3);
  assert.ok(calls.some(c => c[0] === "or" && String(c[1]).includes("month.gte.11")));
  assert.ok(calls.some(c => c[0] === "or" && String(c[1]).includes("month.lt.1")));
  assert.ok(calls.every(c => ["from", "select", "eq", "or", "order", "limit", "in"].includes(c[0])));
  assert.ok(!JSON.stringify(result).includes("household"));
});

test("empty history never creates months and truncated history fails closed", async () => {
  const empty = fixture([{ data: [], count: 0 }]);
  assert.equal((await readSpendingSnapshot(empty.client, "h", 2026, 1, 1)).transactions.length, 0);
  assert.equal(empty.calls.filter(c => c[0] === "from").length, 1);
  const truncated = fixture([{ data: [], count: 1 }]);
  await assert.rejects(readSpendingSnapshot(truncated.client, "h", 2026, 1, 1), /Incomplete/);
  const tooMany = fixture([{ data: [{ id: "m", year: 2025, month: 12 }], count: 1 }, { data: [], count: 201 }]);
  await assert.rejects(readSpendingSnapshot(tooMany.client, "h", 2026, 1, 1), /Too many categories/);
});

test("merchant text bounds and removes common identifiers", () => {
  assert.equal(reviewText("Market hello@example.com 123456789012 https://example.com"), "Market [redacted] [redacted] [redacted]");
  assert.equal(reviewText("x".repeat(200)).length, 100);
  assert.equal(reviewText("123 Main Street"), "[redacted]");
  assert.ok(!reviewText("account AB123456789").includes("123456789"));
});

test("spending analysis uses observed months, exact cents and merchant evidence", () => {
  const result = analyzeSpending({ start: "2025-10-01", end: "2026-01-01", monthsRequested: 3, monthsRecorded: 2,
    categories: [
      { year: 2025, month: 10, categoryName: "Food", planned: 100, actual: 10.1 },
      { year: 2025, month: 12, categoryName: "Food", planned: 100, actual: 20.2 },
    ],
    transactions: [
      { categoryName: "Food", merchant: "Market", amount: 10.1, date: "2025-10-01" },
      { categoryName: "Food", merchant: "Market", amount: 20.2, date: "2025-12-01" },
    ],
  });
  assert.deepEqual(result.categories, [{ categoryName: "Food", total: 30.3, monthsObserved: 2, averagePerObservedMonth: 15.15 }]);
  assert.deepEqual(result.merchants, [{ merchant: "Market", total: 30.3, purchases: 2, distinctPurchaseMonths: 2 }]);
});
