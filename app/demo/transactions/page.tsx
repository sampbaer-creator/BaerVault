import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/mockFinanceData";
export default function DemoTransactionsPage() { return <TransactionsWorkspace initialMonth={withDemoSpendingAccounts(augustBudget)} />; }
