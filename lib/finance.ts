export type Purchase = {
  id: string;
  amount: number;
  description: string;
  date: string;
  accountId?: string | null;
  accountName?: string | null;
};

export type BudgetCategory = {
  id: string;
  name: string;
  plannedAmount: number;
  purchases: Purchase[];
};

export type IncomeEntry = {
  id: string;
  amount: number;
  source: string;
  date: string;
  owner: string;
  note?: string;
};

export type BudgetMonth = {
  month: string;
  incomeEntries: IncomeEntry[];
  categories: BudgetCategory[];
};

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function categoryActual(category: BudgetCategory) {
  return category.purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
}

export function categoryRemaining(category: BudgetCategory) {
  return category.plannedAmount - categoryActual(category);
}

export function totalIncome(month: BudgetMonth) {
  return month.incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
}

export function totalPlanned(month: BudgetMonth) {
  return month.categories.reduce((sum, category) => sum + category.plannedAmount, 0);
}

export function totalSpending(month: BudgetMonth) {
  return month.categories.reduce((sum, category) => sum + categoryActual(category), 0);
}

export function netCashFlow(month: BudgetMonth) {
  return totalIncome(month) - totalSpending(month);
}

export function savingsRate(month: BudgetMonth) {
  const income = totalIncome(month);
  return income === 0 ? 0 : netCashFlow(month) / income;
}
