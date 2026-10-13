import type { Metadata } from "next";

export const metadata: Metadata = { title: "Demo accounts" };

import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { demoFinancialAccounts } from "@/lib/demo/accounts";

export default function DemoAccountsPage() {
  return <AccountsWorkspace initialAccounts={demoFinancialAccounts} demo />;
}
