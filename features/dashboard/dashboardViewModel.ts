import {
  categoryActual,
  totalIncome,
  totalPlanned,
  totalSpending,
  type BudgetMonth,
} from "@/lib/demo/finance";
import { isDebtAccount, type FinancialAccount } from "@/lib/demo/accounts";
import { costFor, sharesFor, type InvestmentAccount } from "@/lib/demo/investmentData";
import type { UpcomingPayment } from "@/lib/helpers/recurring";
import type { DashboardViewModel } from "@/lib/dashboard";
import type { SavingsGoal } from "@/lib/demo/goals";
import { displayMerchantName, displayOwnerName, displayShortDate } from "@/lib/helpers/display";

export function daysLeftInMonth(year: number, month: number, today: Date) {
  const selected = year * 12 + month;
  const current = today.getFullYear() * 12 + today.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  if (selected < current) return 0;
  if (selected > current) return lastDay;
  return lastDay - today.getDate() + 1;
}

export function spendingStatus(planned: number, spending: number): DashboardViewModel["budgetStatus"] {
  if (spending > planned) return "over";
  if (planned > 0 && (planned - spending) / planned <= 0.1) return "close";
  return "on-track";
}

export function createDashboardViewModel(
  budget: BudgetMonth,
  accounts: InvestmentAccount[],
  financialAccounts: FinancialAccount[] = [],
  upcomingPayments: UpcomingPayment[] = [],
  goals: SavingsGoal[] = [],
  period?: { year: number; month: number; today?: Date },
  reviewCount = 0,
): DashboardViewModel {
  const income = totalIncome(budget);
  const spending = totalSpending(budget);
  const dashboardAccounts = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    owner: account.owner,
    holdings: account.holdings.map((holding) => ({
      symbol: holding.symbol,
      shares: sharesFor(holding),
      fallbackPrice: holding.fallbackPrice || (sharesFor(holding) ? costFor(holding) / sharesFor(holding) : 0),
    })),
  }));

  const activity = [
    ...budget.incomeEntries.map((entry) => ({
      id: entry.id,
      name: displayMerchantName(entry.source),
      meta: `${displayOwnerName(entry.owner)} · ${displayShortDate(entry.date)}`,
      date: entry.date,
      amount: entry.amount,
      incoming: true,
      createdByClerkUserId: null,
    })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({
        id: purchase.id,
        name: displayMerchantName(purchase.description),
        meta: `${category.name}${purchase.accountName ? ` · ${purchase.accountName}` : ""} · ${displayShortDate(purchase.date)}`,
        date: purchase.date,
        amount: purchase.amount,
        incoming: false,
        createdByClerkUserId: purchase.createdByClerkUserId,
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
      createdByClerkUserId: item.createdByClerkUserId,
    }));

  return {
    upcomingPayments,
    goals,
    leftToSpend: totalPlanned(budget) - spending,
    daysLeft: period ? daysLeftInMonth(period.year, period.month, period.today ?? new Date()) : 0,
    budgetStatus: spendingStatus(totalPlanned(budget), spending),
    reviewCount,
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
    categories: budget.categories
      .map((category) => ({
        name: category.name,
        value: categoryActual(category),
        planned: category.plannedAmount,
      }))
      .filter((category) => category.value > 0 || category.planned > 0)
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
