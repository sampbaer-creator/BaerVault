import { AccountsWorkspace } from "@/features/accounts/AccountsWorkspace";
import { demoFinancialAccounts } from "@/lib/demo/accounts";
import { investmentAccounts } from "@/lib/demo/investmentData";
import { InvestmentsWorkspace } from "@/features/investments/InvestmentsWorkspace";
import { DemoGoals } from "@/components/demo/DemoGoals";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { accountTabs, selectedTab, type SectionQuery } from "@/lib/helpers/sectionNavigation";

export default async function DemoAccountsPage({ searchParams }: { searchParams: Promise<SectionQuery> }) {
  const query = await searchParams;
  const tab = selectedTab(query.tab, accountTabs.map(({ value }) => value), "accounts");
  const tabs = <SectionTabs basePath="/demo/accounts" active={tab} tabs={accountTabs} year={typeof query.year === "string" ? query.year : undefined} month={typeof query.month === "string" ? query.month : undefined} />;
  if (tab === "investments") return <>{tabs}<InvestmentsWorkspace initialAccounts={investmentAccounts} demo /></>;
  if (tab === "goals") return <>{tabs}<DemoGoals /></>;
  return <>{tabs}<AccountsWorkspace initialAccounts={demoFinancialAccounts} demo /></>;
}
