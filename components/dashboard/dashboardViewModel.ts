import {
  categoryActual,
  totalIncome,
  totalPlanned,
  totalSpending,
  type BudgetMonth,
} from "@/lib/finance";
import { isDebtAccount, type FinancialAccount } from "@/lib/accounts";
import { sharesFor, type InvestmentAccount } from "@/lib/investmentData";

export type DashboardCashFlowPoint = {
  day: string;
  income: number;
  spending: number;
};

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
  cashFlowSeries: DashboardCashFlowPoint[];
  categories: DashboardCategory[];
  activity: DashboardActivity[];
  accounts: DashboardAccount[];
  financialAccounts: DashboardFinancialAccount[];
  symbols: string[];
};

export function createDashboardViewModel(
  budget: BudgetMonth,
  accounts: InvestmentAccount[],
  financialAccounts: FinancialAccount[] = [],
): DashboardViewModel {
  const events = [
    ...budget.incomeEntries.map((entry) => ({
      date: entry.date,
      income: entry.amount,
      spending: 0,
    })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({
        date: purchase.date,
        income: 0,
        spending: purchase.amount,
      })),
    ),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let cumulativeIncome = 0;
  let cumulativeSpending = 0;
  const cashFlowByDate = new Map<string, { income: number; spending: number }>();
  for (const event of events) {
    cumulativeIncome += event.income;
    cumulativeSpending += event.spending;
    cashFlowByDate.set(event.date, {
      income: cumulativeIncome,
      spending: cumulativeSpending,
    });
  }

  const income = totalIncome(budget);
  const spending = totalSpending(budget);
  const dashboardAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    owner: account.owner,
    holdings: account.holdings.map((holding) => ({
      symbol: holding.symbol,
      shares: sharesFor(holding),
      fallbackPrice: holding.fallbackPrice,
    })),
  }));

  const activity = [
    ...budget.incomeEntries.map((entry) => ({
      id: entry.id,
      name: entry.source,
      meta: `${entry.owner} · ${entry.date}`,
      date: entry.date,
      amount: entry.amount,
      incoming: true,
    })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({
        id: purchase.id,
        name: purchase.description,
        meta: `${category.name}${purchase.accountName ? ` · ${purchase.accountName}` : ""} · ${purchase.date}`,
        date: purchase.date,
        amount: purchase.amount,
        incoming: false,
      })),
    ),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      name: item.name,
      meta: item.meta,
      amount: item.amount,
      incoming: item.incoming,
    }));

  return {
    month: budget.month,
    income,
    spending,
    planned: totalPlanned(budget),
    cashAvailable: income - spending,
    cashAssets: financialAccounts.reduce(
      (sum, account) => sum + (isDebtAccount(account.type) ? 0 : account.balance),
      0,
    ),
    debts: financialAccounts.reduce(
      (sum, account) => sum + (isDebtAccount(account.type) ? account.balance : 0),
      0,
    ),
    cashFlowSeries: Array.from(cashFlowByDate, ([date, values]) => ({
      day: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      ...values,
    })),
    categories: budget.categories
      .map((category) => ({
        name: category.name,
        value: categoryActual(category),
        planned: category.plannedAmount,
      }))
      .filter((category) => category.value > 0)
      .sort((a, b) => b.value - a.value),
    activity,
    accounts: dashboardAccounts,
    financialAccounts: financialAccounts.map(
      ({ id, name, institution, type, balance }) => ({
        id,
        name,
        institution,
        type,
        balance,
      }),
    ),
    symbols: [...new Set(dashboardAccounts.flatMap((account) =>
      account.holdings.map((holding) => holding.symbol),
    ))],
  };
}
