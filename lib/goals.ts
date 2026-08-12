export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  monthlyContribution: number;
};
