import { InvestmentsWorkspace } from "@/components/investments/InvestmentsWorkspace";
import { getInvestmentAccounts } from "@/lib/data/investments";

export default async function InvestmentsPage() {
  const accounts = await getInvestmentAccounts();
  return <InvestmentsWorkspace initialAccounts={accounts} />;
}
