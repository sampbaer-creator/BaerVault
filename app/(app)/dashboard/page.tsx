import { DashboardOverview } from "@/features/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBudgetMonth } from "@/lib/data/budgets";
import { getInvestmentAccounts } from "@/lib/data/investments";
import { getUpcomingPayments } from "@/lib/data/recurring";
import { getSavingsGoals } from "@/lib/data/goals";
import { countTransactionsToReview } from "@/lib/data/bankTransactions";
import { parseExplicitMonthSelection, parseMonthSelection } from "@/lib/helpers/monthSelection";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const explicitSelection = parseExplicitMonthSelection(query.year, query.month);
  const [budget, accounts, financialAccounts, upcoming, goals, reviewCount] = await Promise.all([
    getBudgetMonth(selected.year, selected.month),
    getInvestmentAccounts(),
    getFinancialAccounts(),
    getUpcomingPayments(selected.year, selected.month),
    getSavingsGoals(),
    countTransactionsToReview(),
  ]);
  return <DashboardOverview model={createDashboardViewModel(budget, accounts, financialAccounts, upcoming, goals, selected, reviewCount)} selectedMonth={explicitSelection} />;
}
