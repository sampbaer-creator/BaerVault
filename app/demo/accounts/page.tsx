import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { demoFinancialAccounts } from "@/lib/demo/accounts";

export default function DemoAccountsPage() {
  return <AccountsWorkspace initialAccounts={demoFinancialAccounts} demo />;
}
