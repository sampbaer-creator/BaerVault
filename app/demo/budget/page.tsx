import { DemoBudgets } from "@/components/demo/DemoBudgets";
import { CashFlowWorkspace } from "@/features/cash-flow/CashFlowWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { budgetTabs, selectedTab, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoBudgetsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const requestedYear = Number(query.year), requestedMonth = Number(query.month);
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2200 ? requestedYear : 2026;
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : 8;
  const tab = selectedTab(query.tab, budgetTabs.map(({ value }) => value), "budget");
  const tabs = <SectionTabs basePath="/demo/budget" active={tab} tabs={budgetTabs} year={year} month={month} />;
  if (tab === "cash-flow") return <>{tabs}<CashFlowWorkspace month={withDemoSpendingAccounts(augustBudget)} /></>;
  return <>{tabs}<DemoBudgets year={year} month={month} /></>;
}
