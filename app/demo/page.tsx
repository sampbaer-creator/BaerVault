import { DashboardOverview } from "@/features/dashboard/DashboardOverview";
import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { demoFinancialAccounts } from "@/lib/demo/accounts";
import { investmentAccounts } from "@/lib/demo/investmentData";
import { augustBudget } from "@/lib/demo/mockFinanceData";
import { demoSavingsGoals } from "@/lib/demo/mockGoals";

export default function DemoPage() {
  return (
    <DashboardOverview
      model={createDashboardViewModel(augustBudget, investmentAccounts, demoFinancialAccounts, [
        { id: "demo-electric", name: "Electric bill", amount: 128, date: "2026-08-24", estimated: true },
        { id: "demo-internet", name: "Internet", amount: 79, date: "2026-08-27", estimated: true },
      ], demoSavingsGoals, { year: 2026, month: 8, today: new Date(2026, 7, 20) }, 2)}
      basePath="/demo"
      members={[{ userId: "demo-sam", name: "Sam", imageUrl: "" }, { userId: "demo-bailey", name: "Bailey", imageUrl: "" }]}
    />
  );
}
