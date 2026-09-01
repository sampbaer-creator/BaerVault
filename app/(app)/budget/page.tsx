import { BudgetWorkspace } from "@/features/budget/BudgetWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseMonthSelection } from "@/lib/monthSelection";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const query = await searchParams;
  const { year, month } = parseMonthSelection(query.year, query.month);
  const [budget, accounts] = await Promise.all([
    getBudgetMonth(year, month),
    getFinancialAccounts(),
  ]);
  return (
    <BudgetWorkspace
      key={`${year}-${month}`}
      initialBudget={budget}
      accounts={accounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))}
    />
  );
}
