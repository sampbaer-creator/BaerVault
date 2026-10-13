import { GoalsWorkspace } from "@/features/goals/GoalsWorkspace";
import { getSavingsGoals } from "@/lib/data/goals";

export default async function GoalsPage() {
  return <GoalsWorkspace initialGoals={await getSavingsGoals()} />;
}
