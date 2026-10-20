import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";
import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { selectedTab, transactionTabs, type SectionQuery } from "@/lib/helpers/sectionNavigation";
import type { ReviewQueueItem } from "@/lib/helpers/reviewQueue";

export default async function DemoTransactionsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const tab = selectedTab(query.tab, transactionTabs.map(({ value }) => value), "transactions");
  const tabs = <SectionTabs basePath="/demo/transactions" active={tab} tabs={transactionTabs} year={typeof query.year === "string" ? query.year : undefined} month={typeof query.month === "string" ? query.month : undefined} />;
  const month = withDemoSpendingAccounts(augustBudget);
  const reviewTransactions: ReviewQueueItem[] = [
    { id: "demo-review-1", description: "Neighborhood Market", amount: 46.72, providerCategory: "GROCERIES", transactionDate: "2026-08-19", accountId: "demo-checking", budgetEntryId: "demo-entry-1" },
    { id: "demo-review-2", description: "City Transit", amount: 18.5, providerCategory: "TRANSPORTATION", transactionDate: "2026-08-18", accountId: "demo-checking", budgetEntryId: "demo-entry-2" },
  ];
  if (tab === "recurring") return <>{tabs}<RecurringWorkspace month={month} /></>;
  return <>{tabs}<TransactionsWorkspace initialMonth={month} reviewTransactions={reviewTransactions} period={{ year: 2026, month: 8 }} /></>;
}
