import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";

export default async function AccountsPage() {
  const accounts = await getFinancialAccounts();
  return <AccountsWorkspace initialAccounts={accounts} />;
}
