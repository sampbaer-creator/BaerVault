import { CashFlowWorkspace } from "@/features/cash-flow/CashFlowWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";

export default function DemoCashFlowPage() { return <CashFlowWorkspace month={withDemoSpendingAccounts(augustBudget)} />; }
