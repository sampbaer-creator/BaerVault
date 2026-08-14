import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/components/dashboard/dashboardViewModel";
import { getBudgetMonth } from "@/lib/data/budgets";
import { getInvestmentAccounts } from "@/lib/data/investments";

export default async function DashboardPage() {
  const now = new Date();
  const [budget, accounts] = await Promise.all([
    getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1),
    getInvestmentAccounts(),
  ]);
  return <DashboardOverview model={createDashboardViewModel(budget, accounts)} />;
}
