import { BudgetWorkspace } from "@/features/budget/BudgetWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBudgetHistory, getBudgetMonth } from "@/lib/data/budgets";
import { parseMonthSelection } from "@/lib/helpers/monthSelection";
import * as budgetActions from "./actions";
import { getBudgetAdviceAction } from "./aiActions";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const query = await searchParams;
  const { year, month } = parseMonthSelection(query.year, query.month);
  const [budget, accounts, history] = await Promise.all([
    getBudgetMonth(year, month),
    getFinancialAccounts(),
    getBudgetHistory(year, month, 6),
  ]);
  const hasEnoughHistory = new Set(history.map((entry) => `${entry.year}-${entry.month}`)).size >= 3;
  const allCategoriesUnplanned = budget.categories.every((category) => category.plannedAmount === 0);
  return (
    <BudgetWorkspace
      key={`${year}-${month}`}
      initialBudget={budget}
      accounts={accounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))}
      showAdviceBanner={hasEnoughHistory && allCategoriesUnplanned}
      actions={{ ...budgetActions, getBudgetAdviceAction }}
    />
  );
}
