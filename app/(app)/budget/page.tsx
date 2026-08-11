import { BudgetWorkspace } from "@/components/budget/BudgetWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";

export default async function BudgetPage() {
  const now = new Date();
  const budget = await getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return <BudgetWorkspace initialBudget={budget} />;
}
