import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";
import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { selectedTab, transactionTabs, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoTransactionsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const tab = selectedTab(query.tab, transactionTabs.map(({ value }) => value), "transactions");
  const tabs = <SectionTabs basePath="/demo/transactions" active={tab} tabs={transactionTabs} year={typeof query.year === "string" ? query.year : undefined} month={typeof query.month === "string" ? query.month : undefined} />;
  const month = withDemoSpendingAccounts(augustBudget);
  if (tab === "recurring") return <>{tabs}<RecurringWorkspace month={month} /></>;
  return <>{tabs}<TransactionsWorkspace initialMonth={month} /></>;
}
