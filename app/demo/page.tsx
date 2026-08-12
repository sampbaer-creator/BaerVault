import { DashboardOverview } from "@/components/dashboard/DashboardOverview";import { augustBudget } from "@/lib/mockFinanceData";import { investmentAccounts } from "@/lib/investmentData";
export default function DemoPage(){return <DashboardOverview budget={augustBudget} accounts={investmentAccounts} basePath="/demo"/>}
