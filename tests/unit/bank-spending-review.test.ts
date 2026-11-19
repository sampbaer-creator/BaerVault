import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { readBankSpendingSnapshot } from "@/lib/data/bankSpendingReviewQuery";
import { resolveAdviceCategories } from "@/lib/helpers/budgetAdvice";
import { reviewSourceLabel, summarizeSpending } from "@/lib/helpers/spendingReview";

const row = (overrides = {}) => ({ household_id: "h", transaction_date: "2025-12-02", description: "Market", counterparty_name: null, amount: "12.30", category: "Food", status: "posted", match_status: "unmatched", ...overrides });
function fixture(rows: ReturnType<typeof row>[], countOverride?: number | null, truncate?: number) {
  const calls: Array<[string, ...unknown[]]> = [];
  const client = { from(table: string) {
    calls.push(["from", table]);
    let selected = rows;
    let limit = Infinity;
    const chain = new Proxy({}, { get(_target, name) {
      if (name === "then") return (resolve: (value: unknown) => unknown) => {
        const data = selected.slice(0, truncate ?? limit);
        return Promise.resolve({ data, count: countOverride === undefined ? selected.length : countOverride, error: null }).then(resolve);
      };
      return (...args: unknown[]) => {
        const method = String(name);
        calls.push([method, ...args]);
        const [key, value] = args as [keyof ReturnType<typeof row>, never];
        if (method === "eq") selected = selected.filter(item => item[key] === value);
        if (method === "neq") selected = selected.filter(item => item[key] !== value);
        if (method === "gte") selected = selected.filter(item => String(item[key]) >= String(value));
        if (method === "gt") selected = selected.filter(item => Number(item[key]) > Number(value));
        if (method === "lt") selected = selected.filter(item => String(item[key]) < String(value));
        if (method === "limit") limit = Number(args[0]);
        return chain;
      };
    } });
    return chain;
  } };
  return { client: client as unknown as Parameters<typeof readBankSpendingSnapshot>[0], calls };
}

test("bank query enforces household, exclusive calendar bounds, posted positive non-excluded outflows, without writes or ledger reads", async () => {
  const { client, calls } = fixture([
    row({ transaction_date: "2025-11-01", amount: 1 }), row(),
    row({ transaction_date: "2025-10-31" }), row({ transaction_date: "2026-01-01" }),
    row({ household_id: "other" }), row({ status: "pending" }), row({ amount: 0 }), row({ amount: -20 }), row({ match_status: "excluded" }),
  ]);
  const result = await readBankSpendingSnapshot(client, "h", 2026, 1, 2);
  assert.equal(summarizeSpending(result).total, 13.3);
  assert.equal(result.transactions.length, 2);
  assert.equal(result.source, "bank");
  assert.equal(result.monthsRecorded, 2);
  assert.deepEqual(calls.filter(c => c[0] === "from"), [["from", "bank_transactions"]]);
  assert.deepEqual(calls.find(c => c[0] === "select"), ["select", "transaction_date, description, counterparty_name, amount, category", { count: "exact" }]);
  assert.ok(calls.some(c => c[0] === "limit" && c[1] === 1000));
  assert.ok(calls.every(c => ["from", "select", "eq", "neq", "gte", "gt", "lt", "order", "limit"].includes(c[0])));
});

test("bank cap and exact count fail closed, including silent server truncation and unknown counts", async () => {
  for (const count of [1001, null, 2]) {
    const { client } = fixture([row()], count);
    await assert.rejects(readBankSpendingSnapshot(client, "h", 2026, 1, 1), /Too many|Incomplete/);
  }
  const truncated = fixture([row(), row()], undefined, 1);
  await assert.rejects(readBankSpendingSnapshot(truncated.client, "h", 2026, 1, 1), /Incomplete/);
  const capped = fixture(Array.from({ length: 1000 }, () => row()));
  assert.equal((await readBankSpendingSnapshot(capped.client, "h", 2026, 1, 1)).transactions.length, 1000);
});

test("bank history redacts merchants, groups exact cents by month and provider identity, with no planned budgets", async () => {
  const names = new Map<string, string>();
  const { client } = fixture([
    row({ category: "Fund 123", amount: ".10", counterparty_name: "Shop hello@example.com 123456789012" }),
    row({ category: "Fund 123", amount: ".20" }), row({ category: "Fund 456", amount: 2 }),
    row({ category: "Fund 123", transaction_date: "2025-10-01", amount: 4 }),
  ]);
  const snapshot = await readBankSpendingSnapshot(client, "h", 2026, 1, 3, names);
  assert.equal(snapshot.monthsRecorded, 2);
  assert.equal(snapshot.categories.length, 3);
  assert.equal(snapshot.categories[0].actual, .3);
  assert.ok(snapshot.categories.every(c => c.planned === 0));
  assert.equal(snapshot.categories[0].categoryId, snapshot.categories[2].categoryId);
  assert.notEqual(snapshot.categories[0].categoryId, snapshot.categories[1].categoryId);
  assert.equal(snapshot.categories[0].categoryName, snapshot.categories[1].categoryName);
  assert.equal(snapshot.transactions[0].merchant, "Shop [redacted] [redacted]");
  assert.ok(!JSON.stringify(snapshot).includes("hello@example.com"));
  const resolved = resolveAdviceCategories({ suggestions: [{ categoryId: snapshot.categories[1].categoryId, isNewCategory: false, categoryName: "wrong", suggestedAmount: 2, rationale: "Estimate" }], overallTip: "Estimate", confidence: "low" }, names);
  assert.equal(resolved.suggestions[0].categoryName, "Fund 456");
});

test("bank empty history counts no months, validates 12-month maximum before reads, and bounds payload bytes", async () => {
  const empty = fixture([]);
  assert.equal((await readBankSpendingSnapshot(empty.client, "h", 2026, 1, 1)).monthsRecorded, 0);
  const invalid = fixture([]);
  await assert.rejects(readBankSpendingSnapshot(invalid.client, "h", 2026, 1, 13));
  assert.equal(invalid.calls.length, 0);
  const huge = fixture(Array.from({ length: 1000 }, () => row({ description: "?".repeat(100), category: "?".repeat(100) })));
  await assert.rejects(readBankSpendingSnapshot(huge.client, "h", 2026, 1, 1), /too large/);
});

test("bank label and wiring preserve opt-in disclosure, exclusive reader selection and authenticated read-only client", () => {
  assert.equal(reviewSourceLabel("bank"), "Imported bank transactions (estimated)");
  assert.equal(reviewSourceLabel("ledger"), "Ledger purchases");
  const action = readFileSync("features/budgets/budgetAdviceActions.ts", "utf8");
  assert.ok(action.includes('input.source ?? "ledger"'));
  assert.ok(action.includes('source === "bank" ? getBankSpendingSnapshot : getSpendingSnapshot'));
  assert.ok(action.includes('consume_budget_advice_quota'));
  assert.ok(action.includes('forecastBudget(history, categoryNames)'));
  const reader = readFileSync("lib/data/bankSpendingReview.ts", "utf8");
  assert.ok(reader.startsWith('import "server-only"'));
  assert.ok(reader.includes('await getReviewHousehold()'));
  assert.ok(reader.includes('createServerSupabaseClient()'));
  const ui = readFileSync("features/budgets/BudgetsWorkspace.tsx", "utf8");
  assert.ok(ui.includes('useState<ReviewSource>("ledger")'));
  assert.ok(ui.includes('Only when you click Review'));
  assert.ok(ui.includes('does not mark transactions reviewed or modify budgets'));
  assert.ok(ui.includes('Bank history review (estimated)'));
});

test("provider IDs remain stable when another range adds categories with colliding redacted labels", async () => {
  const first = fixture([row({ category: "Fund 456" })]);
  const second = fixture([row({ category: "Fund 123" }), row({ category: "Fund 456" })]);
  const one = await readBankSpendingSnapshot(first.client, "h", 2026, 1, 1);
  const two = await readBankSpendingSnapshot(second.client, "h", 2026, 1, 1);
  assert.equal(one.categories[0].categoryId, two.categories[1].categoryId);
  assert.notEqual(two.categories[0].categoryId, two.categories[1].categoryId);
});


test("bank forecasts exclude transfers, card payments, loan payments and income based on provider categories", async () => {
  const excluded = ["TRANSFER_IN", "TRANSFER_OUT_ACCOUNT_TRANSFER", "LOAN_PAYMENTS_CREDIT_CARD_PAYMENT", "CREDIT_CARD_PAYMENT", "Credit Card Payments", "LOAN_PAYMENTS", "INCOME_WAGES"];
  const { client } = fixture([...excluded.map(category => row({ category, amount: 999 })), row({ category: "FOOD_AND_DRINK_GROCERIES", amount: 12.34 })]);
  const result = await readBankSpendingSnapshot(client, "h", 2026, 1, 1);
  assert.equal(result.transactions.length, 1);
  assert.equal(summarizeSpending(result).total, 12.34);
  assert.equal(result.categories[0].categoryName, "FOOD_AND_DRINK_GROCERIES");
});
