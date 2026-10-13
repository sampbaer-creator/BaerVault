import type { Metadata } from "next";

export const metadata: Metadata = { title: "Demo recurring" };

import { RecurringWorkspace } from "@/features/recurring/RecurringWorkspace";
import { augustBudget, withDemoSpendingAccounts } from "@/lib/demo/mockFinanceData";

export default function DemoRecurringPage() { return <RecurringWorkspace month={withDemoSpendingAccounts(augustBudget)} />; }
