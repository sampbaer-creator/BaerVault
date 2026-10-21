import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseExplicitMonthSelection, parseMonthSelection } from "@/lib/helpers/monthSelection";
import { getUpcomingPayments } from "@/lib/data/recurring";
import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { selectedTab, transactionTabs, type SectionQuery } from "@/lib/helpers/sectionNavigation";
import { getTransactionsToReview } from "@/lib/data/bankTransactions";
import { getHouseholdMembers, type HouseholdMember } from "@/lib/data/households";
import type { ReviewQueueItem } from "@/lib/helpers/reviewQueue";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const tab = selectedTab(query.tab, transactionTabs.map(({ value }) => value), "transactions");
  const tabs = <SectionTabs basePath="/transactions" active={tab} tabs={transactionTabs} year={selected.year} month={selected.month} />;
  const explicitSelection = parseExplicitMonthSelection(query.year, query.month);
  const month = await getBudgetMonth(selected.year, selected.month);
  if (tab === "recurring") return <>{tabs}<RecurringWorkspace month={month} upcoming={await getUpcomingPayments(selected.year, selected.month)} /></>;
  // The review queue is supplemental to the household ledger. A stale or
  // temporarily unavailable review column must not prevent Transactions from
  // rendering its primary income and purchase data.
  let reviewTransactions: ReviewQueueItem[] = [];
  try {
    reviewTransactions = await getTransactionsToReview(selected.year, selected.month);
  } catch {
    reviewTransactions = [];
  }
  let members: HouseholdMember[] = [];
  try {
    members = await getHouseholdMembers();
  } catch {
    members = [];
  }
  return <>{tabs}<TransactionsWorkspace initialMonth={month} selectedMonth={explicitSelection} reviewTransactions={reviewTransactions} period={selected} members={members} /></>;
}
