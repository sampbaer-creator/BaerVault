import { CashFlowOverview } from "@/components/cash-flow/CashFlowOverview";
import { getBudgetMonth } from "@/lib/data/budgets";

export default async function CashFlowPage() {
  const now = new Date();
  const month = await getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
  return <CashFlowOverview initialMonth={month} />;
}
