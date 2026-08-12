import { GoalsWorkspace } from "@/components/goals/GoalsWorkspace";
import { getSavingsGoals } from "@/lib/data/goals";

export default async function GoalsPage() {
  return <GoalsWorkspace initialGoals={await getSavingsGoals()} />;
}
