import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseExplicitMonthSelection, parseMonthSelection } from "@/lib/helpers/monthSelection";
import { getUpcomingPayments } from "@/lib/data/recurring";
import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { selectedTab, transactionTabs, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const tab = selectedTab(query.tab, transactionTabs.map(({ value }) => value), "transactions");
  const tabs = <SectionTabs basePath="/transactions" active={tab} tabs={transactionTabs} year={selected.year} month={selected.month} />;
  const explicitSelection = parseExplicitMonthSelection(query.year, query.month);
  const month = await getBudgetMonth(selected.year, selected.month);
  if (tab === "recurring") return <>{tabs}<RecurringWorkspace month={month} upcoming={await getUpcomingPayments(selected.year, selected.month)} /></>;
  return <>{tabs}<TransactionsWorkspace initialMonth={month} selectedMonth={explicitSelection} /></>;
}
