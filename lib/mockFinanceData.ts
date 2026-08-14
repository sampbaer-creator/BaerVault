import type { BudgetMonth } from "./finance";
import { demoFinancialAccounts } from "./accounts";

export const augustBudget: BudgetMonth = {
  month: "August 2026",
  incomeEntries: [
    { id: "income-1", amount: 1846.15, source: "Trucordia Payroll", date: "2026-08-10", owner: "Samuel" },
    { id: "income-2", amount: 1846.15, source: "Trucordia Payroll", date: "2026-08-24", owner: "Samuel" },
    { id: "income-3", amount: 1707.7, source: "Northstar Studio", date: "2026-08-15", owner: "Bailey" },
  ],
  categories: [
    { id: "housing", name: "Housing", plannedAmount: 1650, purchases: [{ id: "p-h1", amount: 1650, description: "Mortgage", date: "2026-08-01" }] },
    { id: "groceries", name: "Groceries", plannedAmount: 600, purchases: [
      { id: "p-g1", amount: 126.42, description: "Costco", date: "2026-08-11" },
      { id: "p-g2", amount: 84.18, description: "Smith's", date: "2026-08-08" },
      { id: "p-g3", amount: 53.27, description: "Walmart", date: "2026-08-04" },
      { id: "p-g4", amount: 41.12, description: "Macey's", date: "2026-08-01" },
      { id: "p-g5", amount: 116.35, description: "Farmers market", date: "2026-08-09" },
    ] },
    { id: "transport", name: "Gas & transport", plannedAmount: 300, purchases: [
      { id: "p-t1", amount: 68.42, description: "Shell", date: "2026-08-09" },
      { id: "p-t2", amount: 72.76, description: "Maverik", date: "2026-08-04" },
      { id: "p-t3", amount: 60, description: "Transit pass", date: "2026-08-01" },
    ] },
    { id: "dining", name: "Dining", plannedAmount: 250, purchases: [
      { id: "p-d1", amount: 68.4, description: "Copper Onion", date: "2026-08-10" },
      { id: "p-d2", amount: 54.02, description: "Takashi", date: "2026-08-06" },
      { id: "p-d3", amount: 61, description: "Coffee & lunch", date: "2026-08-03" },
    ] },
    { id: "utilities", name: "Utilities", plannedAmount: 340, purchases: [
      { id: "p-u1", amount: 119.24, description: "Rocky Mountain Power", date: "2026-08-07" },
      { id: "p-u2", amount: 74.65, description: "Google Fiber", date: "2026-08-05" },
      { id: "p-u3", amount: 58.12, description: "Water", date: "2026-08-03" },
    ] },
    { id: "subscriptions", name: "Subscriptions", plannedAmount: 145, purchases: [
      { id: "p-s1", amount: 22.99, description: "Netflix", date: "2026-08-08" },
      { id: "p-s2", amount: 16.99, description: "Apple One", date: "2026-08-05" },
      { id: "p-s3", amount: 79, description: "Household software", date: "2026-08-02" },
    ] },
    { id: "entertainment", name: "Entertainment", plannedAmount: 150, purchases: [
      { id: "p-e1", amount: 48.4, description: "Cinema", date: "2026-08-09" },
      { id: "p-e2", amount: 44, description: "Museum", date: "2026-08-02" },
    ] },
    { id: "personal", name: "Personal & home", plannedAmount: 815, purchases: [
      { id: "p-p1", amount: 118.25, description: "Home supplies", date: "2026-08-10" },
      { id: "p-p2", amount: 93.7, description: "Pharmacy", date: "2026-08-06" },
      { id: "p-p3", amount: 178.28, description: "Clothing", date: "2026-08-02" },
    ] },
  ],
};

export function withDemoSpendingAccounts(month: BudgetMonth): BudgetMonth {
  const checking = demoFinancialAccounts.find((account) => account.type === "checking");
  const card = demoFinancialAccounts.find((account) => account.type === "credit_card");
  return {
    ...month,
    categories: month.categories.map((category) => {
      const account = ["Housing", "Utilities", "Gas & transport"].includes(category.name)
        ? checking
        : card;
      return {
        ...category,
        purchases: category.purchases.map((purchase) => ({
          ...purchase,
          accountId: account?.id ?? null,
          accountName: account?.name ?? null,
        })),
      };
    }),
  };
}

export const cashFlowHistory = [
  { month: "Jan", income: 5100, spending: 3900, net: 1200 },
  { month: "Feb", income: 5200, spending: 4050, net: 1150 },
  { month: "Mar", income: 5300, spending: 3820, net: 1480 },
  { month: "Apr", income: 5250, spending: 4100, net: 1150 },
  { month: "May", income: 5400, spending: 3950, net: 1450 },
  { month: "Jun", income: 5400, spending: 3720, net: 1680 },
  { month: "Jul", income: 5400, spending: 3180, net: 2220 },
  { month: "Aug", income: 5400, spending: 3210.18, net: 2189.82 },
];
