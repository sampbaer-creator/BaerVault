import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBankConnections } from "@/lib/data/bankConnections";

export default async function AccountsPage() {
  const [accounts, bankConnections] = await Promise.all([getFinancialAccounts(), getBankConnections()]);
  return <AccountsWorkspace initialAccounts={accounts} bankConnections={bankConnections} />;
}
