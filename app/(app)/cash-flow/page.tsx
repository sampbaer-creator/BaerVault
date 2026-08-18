import { CashFlowWorkspace } from "@/features/cash-flow/CashFlowWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";

export default async function CashFlowPage() {
  const now = new Date();
  const month = await getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return <CashFlowWorkspace month={month} />;
}
