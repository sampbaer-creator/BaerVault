import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";

export default async function RecurringPage() {
  const now = new Date();
  const month = await getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return <RecurringWorkspace month={month} />;
}
