import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBankConnections } from "@/lib/data/bankConnections";
import { getInvestmentAccounts } from "@/lib/data/investments";
import { getSavingsGoals } from "@/lib/data/goals";
import { InvestmentsWorkspace } from "@/features/investments/InvestmentsWorkspace";
import { GoalsWorkspace } from "@/features/goals/GoalsWorkspace";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { accountTabs, selectedTab, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function AccountsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const tab = selectedTab(query.tab, accountTabs.map(({ value }) => value), "accounts");
  const tabs = <SectionTabs basePath="/accounts" active={tab} tabs={accountTabs} year={typeof query.year === "string" ? query.year : undefined} month={typeof query.month === "string" ? query.month : undefined} />;
  if (tab === "investments") return <>{tabs}<InvestmentsWorkspace initialAccounts={await getInvestmentAccounts()} /></>;
  if (tab === "goals") return <>{tabs}<GoalsWorkspace initialGoals={await getSavingsGoals()} /></>;
  const [accounts, bankConnections] = await Promise.all([getFinancialAccounts(), getBankConnections()]);
  return <>{tabs}<AccountsWorkspace initialAccounts={accounts} bankConnections={bankConnections} /></>;
}
