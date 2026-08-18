import { DemoTransactions } from "@/components/demo/DemoTransactions";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/mockFinanceData";
export default function DemoTransactionsPage() { return <DemoTransactions budget={withDemoSpendingAccounts(augustBudget)} />; }
