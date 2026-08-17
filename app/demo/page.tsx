import { DashboardOverview } from "@/features/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { demoFinancialAccounts } from "@/lib/accounts";
import { investmentAccounts } from "@/lib/investmentData";
import { augustBudget } from "@/lib/mockFinanceData";

export default function DemoPage() {
  return (
    <DashboardOverview
      model={createDashboardViewModel(augustBudget, investmentAccounts, demoFinancialAccounts)}
      basePath="/demo"
    />
  );
}
