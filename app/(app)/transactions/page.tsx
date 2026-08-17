import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
export default async function TransactionsPage() { const now = new Date(); const month = await getBudgetMonth(now.getUTCFullYear(), now.getUTCMonth() + 1); return <TransactionsWorkspace initialMonth={month} />; }
