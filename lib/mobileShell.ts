import type { FinancialAccount } from "@/lib/accounts";
import type { BankConnectionSummary } from "@/lib/data/bankConnections";
import type { BudgetMonth } from "@/lib/finance";
import type { SavingsGoal } from "@/lib/goals";
import type { InvestmentAccount } from "@/lib/investmentData";
import type { DashboardViewModel } from "@/features/dashboard/dashboardViewModel";

export type MobileBudgetMonth = BudgetMonth & {
  id: string | null;
  year: number;
  monthNumber: number;
};

export type MobileShellData = {
  selectedMonth: MobileBudgetMonth;
  financialAccounts: FinancialAccount[];
  bankConnections: BankConnectionSummary[];
  investmentAccounts: InvestmentAccount[];
  goals: SavingsGoal[];
  dashboard: DashboardViewModel;
};

export const MOBILE_SHELL_INVALIDATE_EVENT = "bearvault:mobile-shell-invalidate";

export function invalidateMobileShell() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(MOBILE_SHELL_INVALIDATE_EVENT));
}
