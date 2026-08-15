import { InvestmentsWorkspace } from "@/components/investments/InvestmentsWorkspace";
import { investmentAccounts } from "@/lib/investmentData";

export default function DemoInvestmentsPage() {
  return <InvestmentsWorkspace initialAccounts={investmentAccounts} demo />;
}
