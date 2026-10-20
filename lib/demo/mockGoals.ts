import type { SavingsGoal } from "./goals";

export const demoSavingsGoals: SavingsGoal[] = [
  { id: "emergency", name: "Emergency Fund", targetAmount: 18000, savedAmount: 15000, targetDate: "2026-11-30", monthlyContribution: 500 },
  { id: "house", name: "House Down Payment", targetAmount: 60000, savedAmount: 28400, targetDate: "2027-12-31", monthlyContribution: 1200 },
  { id: "car", name: "New Car", targetAmount: 12000, savedAmount: 6200, targetDate: "2027-03-31", monthlyContribution: 400 },
];
