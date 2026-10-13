import type { Metadata } from "next";

export const metadata: Metadata = { title: "Demo transactions" };

import { TransactionsWorkspace } from "@/features/transactions/TransactionsWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";
export default function DemoTransactionsPage() { return <TransactionsWorkspace initialMonth={withDemoSpendingAccounts(augustBudget)} />; }
