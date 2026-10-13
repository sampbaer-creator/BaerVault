import { GoalsWorkspace } from "@/features/goals/GoalsWorkspace";
import type { SavingsGoal } from "@/lib/demo/goals";

const goals: SavingsGoal[] = [
  { id: "demo-emergency", name: "Emergency fund", targetAmount: 18000, savedAmount: 15000, targetDate: "2026-11-30", monthlyContribution: 500 },
  { id: "demo-home", name: "House down payment", targetAmount: 60000, savedAmount: 28400, targetDate: "2027-12-31", monthlyContribution: 1200 },
  { id: "demo-car", name: "New car", targetAmount: 12000, savedAmount: 6200, targetDate: "2027-03-31", monthlyContribution: 400 },
  { id: "demo-trip", name: "Trip to Japan", targetAmount: 5000, savedAmount: 3100, targetDate: "2026-09-30", monthlyContribution: 300 },
  { id: "demo-renovation", name: "Home renovation", targetAmount: 20000, savedAmount: 4800, targetDate: "2028-12-31", monthlyContribution: 350 },
  { id: "demo-retirement", name: "Retirement", targetAmount: 500000, savedAmount: 148000, targetDate: "2050-12-31", monthlyContribution: 1500 },
];

export function DemoGoals() {
  return <GoalsWorkspace initialGoals={goals} demo />;
}
