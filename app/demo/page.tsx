import { DashboardOverview } from "@/features/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { demoFinancialAccounts } from "@/lib/demo/accounts";
import { investmentAccounts } from "@/lib/demo/investmentData";
import { augustBudget } from "@/lib/demo/mockFinanceData";

export default function DemoPage() {
  return (
    <DashboardOverview
      model={createDashboardViewModel(augustBudget, investmentAccounts, demoFinancialAccounts)}
      basePath="/demo"
    />
  );
}
