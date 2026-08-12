import { BudgetWorkspace } from "@/components/budget/BudgetWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const now = new Date();
  const query = await searchParams;
  const requestedYear = Number(query.year);
  const requestedMonth = Number(query.month);
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2200
    ? requestedYear
    : now.getUTCFullYear();
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth
    : now.getUTCMonth() + 1;
  const budget = await getBudgetMonth(year, month);
  return <BudgetWorkspace key={`${year}-${month}`} initialBudget={budget} />;
}
