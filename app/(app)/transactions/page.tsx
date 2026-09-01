import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseExplicitMonthSelection, parseMonthSelection } from "@/lib/monthSelection";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const explicitSelection = parseExplicitMonthSelection(query.year, query.month);
  const month = await getBudgetMonth(selected.year, selected.month);
  return <TransactionsWorkspace initialMonth={month} selectedMonth={explicitSelection} />;
}
