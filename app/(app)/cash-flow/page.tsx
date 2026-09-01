import { CashFlowWorkspace } from "@/features/cash-flow/CashFlowWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { parseMonthSelection } from "@/lib/monthSelection";

export default async function CashFlowPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const selected = parseMonthSelection(query.year, query.month);
  const month = await getBudgetMonth(selected.year, selected.month);
  return <CashFlowWorkspace month={month} />;
}
