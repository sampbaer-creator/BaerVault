import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/components/dashboard/dashboardViewModel";
import { investmentAccounts } from "@/lib/investmentData";
import { augustBudget } from "@/lib/mockFinanceData";

export default function DemoPage() {
  return (
    <DashboardOverview
      model={createDashboardViewModel(augustBudget, investmentAccounts)}
      basePath="/demo"
    />
  );
}
