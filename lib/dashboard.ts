import type { FinancialAccount } from "@/lib/demo/accounts";
import type { UpcomingPayment } from "@/lib/helpers/recurring";

export type DashboardCategory = {
  name: string;
  value: number;
  planned: number;
};

export type DashboardActivity = {
  id: string;
  name: string;
  meta: string;
  amount: number;
  incoming: boolean;
};

export type DashboardAccount = {
  id: string;
  name: string;
  owner: string;
  holdings: Array<{
    symbol: string;
    shares: number;
    fallbackPrice: number;
  }>;
};

export type DashboardFinancialAccount = Pick<
  FinancialAccount,
  "id" | "name" | "institution" | "type" | "balance"
>;

export type DashboardViewModel = {
  month: string;
  income: number;
  spending: number;
  planned: number;
  cashAvailable: number;
  cashAssets: number;
  debts: number;
  categories: DashboardCategory[];
  activity: DashboardActivity[];
  accounts: DashboardAccount[];
  financialAccounts: DashboardFinancialAccount[];
  symbols: string[];
  upcomingPayments: UpcomingPayment[];
};
