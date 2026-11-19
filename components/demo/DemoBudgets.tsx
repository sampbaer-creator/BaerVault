"use client";

import { BudgetsWorkspace } from "@/features/budgets/BudgetsWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";
import { demoFinancialAccounts } from "@/lib/demo/accounts";
import type { BudgetMonth } from "@/lib/demo/finance";
import { forecastBudget } from "@/lib/helpers/budgetForecast";
import { reviewWindow, type ReviewSource, type SpendingSnapshot } from "@/lib/helpers/spendingReview";

const ok = <T,>(data: T) => Promise.resolve({ ok: true as const, data });
const id = () => `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const actions = {
  addCategoryAction: (input: { name: string; plannedAmount: number }) =>
    ok({ id: id(), name: input.name, plannedAmount: input.plannedAmount, purchases: [] }),
  deleteBudgetCategoryAction: () => ok(undefined),
  deleteBudgetEntryAction: () => ok(undefined),
  saveBudgetEntryAction: (input: { id?: string }) => ok({ id: input.id ?? id() }),
  updateBudgetCategoryAction: () => ok(undefined),
  getBudgetAdviceAction: async (input: { year: number; month: number; monthsBack?: number; source?: ReviewSource }) => {
    const count = Math.min(input.monthsBack ?? 6, 3);
    const source = input.source ?? "ledger";
    const window = reviewWindow(input.year, input.month, input.monthsBack ?? 6);
    const history: SpendingSnapshot = {
      source, start: window.start, end: window.end,
      monthsRequested: input.monthsBack ?? 6, monthsRecorded: count,
      categories: [], transactions: []
    };
    const names = new Map<string, string>();
    const factors = [0.91, 1.08, 1];
    for (const [index, category] of augustBudget.categories.entries()) {
      const categoryId = source === "bank" ? `bank_category_demo${index}` : `demo_${category.id}`;
      const categoryName = source === "bank" ? `EXAMPLE_${category.name.toUpperCase().replace(/[^A-Z]+/g, "_")}` : category.name;
      names.set(categoryId, categoryName);
      const observed = category.purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
      for (let offset = count; offset >= 1; offset--) {
        const date = new Date(Date.UTC(input.year, input.month - 1 - offset, 1));
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();
        const amount = Math.round(observed * factors[(count - offset) % factors.length] * 100) / 100;
        history.categories.push({ categoryId, categoryName, year, month, actual: amount, planned: source === "bank" ? 0 : category.plannedAmount });
        history.transactions.push({ categoryId, categoryName, date: `${year}-${String(month).padStart(2, "0")}-01`,
          merchant: `Example ${category.name} purchase`, amount });
      }
    }
    return ok(forecastBudget(history, names));
  }
};

export function DemoBudgets({ year = 2026, month = 8 }: { year?: number; month?: number }) {
  const isFeaturedMonth = year === 2026 && month === 8;
  const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  const source = isFeaturedMonth ? withDemoSpendingAccounts(augustBudget) : { categories: [], incomeEntries: [] };
  const budget: BudgetMonth & { year: number; monthNumber: number } = { ...source, month: label, year, monthNumber: month };
  return <BudgetsWorkspace
    key={`${year}-${month}`}
    initialBudget={budget}
    accounts={demoFinancialAccounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))}
    members={[{ userId: "demo-sam", name: "Sam", imageUrl: "" }, { userId: "demo-bailey", name: "Bailey", imageUrl: "" }]}
    actions={actions}
  />;
}
