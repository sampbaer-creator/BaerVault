import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBankConnections } from "@/lib/data/bankConnections";

export default async function AccountsPage() {
  const [accounts, bankConnections] = await Promise.all([getFinancialAccounts(), getBankConnections()]);
  const workspaceVersion = [
    ...accounts.map((account) => `${account.id}:${account.updatedAt}`),
    ...bankConnections.map((connection) => `${connection.id}:${connection.lastSyncedAt ?? connection.status}`),
  ].join("|");
  return <AccountsWorkspace key={workspaceVersion} initialAccounts={accounts} bankConnections={bankConnections} />;
}
