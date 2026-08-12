import { TransactionsReference } from "@/components/reference/FinancePages";
import { augustBudget } from "@/lib/mockFinanceData";
export default function DemoTransactionsPage() { return <TransactionsReference budget={augustBudget} />; }
