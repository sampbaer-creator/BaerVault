import { InvestmentsWorkspace } from "@/features/investments/InvestmentsWorkspace";
import { investmentAccounts } from "@/lib/demo/investmentData";

export default function DemoInvestmentsPage() {
  return <InvestmentsWorkspace initialAccounts={investmentAccounts} demo />;
}
