import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";

export default function DemoRecurringPage() { return <RecurringWorkspace month={withDemoSpendingAccounts(augustBudget)} />; }
