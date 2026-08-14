import { TransactionsReference } from "@/components/reference/FinancePages";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/mockFinanceData";
export default function DemoTransactionsPage() { return <TransactionsReference budget={withDemoSpendingAccounts(augustBudget)} />; }
