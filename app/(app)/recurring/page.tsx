import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseMonthSelection } from "@/lib/monthSelection";

export default async function RecurringPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const month = await getBudgetMonth(selected.year, selected.month);
  return <RecurringWorkspace month={month} />;
}
