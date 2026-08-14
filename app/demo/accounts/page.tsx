import { AccountsWorkspace } from "@/components/accounts/AccountsWorkspace";
import { demoFinancialAccounts } from "@/lib/accounts";

export default function DemoAccountsPage() {
  return <AccountsWorkspace initialAccounts={demoFinancialAccounts} demo />;
}
