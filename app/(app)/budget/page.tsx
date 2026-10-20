import { BudgetsWorkspace } from "@/features/budgets/BudgetsWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBudgetHistory, getBudgetMonth } from "@/lib/data/budgets";
import { parseMonthSelection } from "@/lib/helpers/monthSelection";
import * as budgetActions from "@/features/budgets/actions";
import { getBudgetAdviceAction } from "@/features/budgets/budgetAdviceActions";
import { CashFlowWorkspace } from "@/features/cash-flow/CashFlowWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { budgetTabs, selectedTab, type SectionQuery } from "@/lib/helpers/sectionNavigation";
import { getHouseholdMembers } from "@/lib/data/households";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<SectionQuery>;
}) {
  const query = await searchParams;
  const { year, month } = parseMonthSelection(query.year, query.month);
  const tab = selectedTab(query.tab, budgetTabs.map(({ value }) => value), "budget");
  const tabs = <SectionTabs basePath="/budget" active={tab} tabs={budgetTabs} year={year} month={month} />;
  if (tab === "cash-flow") return <>{tabs}<CashFlowWorkspace month={await getBudgetMonth(year, month)} /></>;
  const [budget, accounts, history, members] = await Promise.all([
    getBudgetMonth(year, month),
    getFinancialAccounts(),
    getBudgetHistory(year, month, 6),
    getHouseholdMembers(),
  ]);
  const hasEnoughHistory = new Set(history.map((entry) => `${entry.year}-${entry.month}`)).size >= 3;
  const allCategoriesUnplanned = budget.categories.every((category) => category.plannedAmount === 0);
  return (
    <>{tabs}<BudgetsWorkspace
      key={`${year}-${month}`}
      initialBudget={budget}
      accounts={accounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))}
      showAdviceBanner={hasEnoughHistory && allCategoriesUnplanned}
      members={members}
      actions={{ ...budgetActions, getBudgetAdviceAction }}
    /></>
  );
}
