import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { getUpcomingPayments } from "@/lib/data/recurring";
import { parseMonthSelection } from "@/lib/monthSelection";

export default async function RecurringPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const [month, upcoming] = await Promise.all([getBudgetMonth(selected.year, selected.month), getUpcomingPayments(selected.year, selected.month)]);
  return <RecurringWorkspace month={month} upcoming={upcoming} />;
}
