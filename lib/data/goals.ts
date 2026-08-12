import "server-only";

import type { SavingsGoal } from "@/lib/goals";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

type GoalRow = { id: string; name: string; target_amount: number | string; saved_amount: number | string; target_date: string | null; monthly_contribution: number | string };
const mapGoal = (row: GoalRow): SavingsGoal => ({ id: row.id, name: row.name, targetAmount: Number(row.target_amount), savedAmount: Number(row.saved_amount), targetDate: row.target_date, monthlyContribution: Number(row.monthly_contribution) });

export async function getSavingsGoals() {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("savings_goals").select("id, name, target_amount, saved_amount, target_date, monthly_contribution").eq("household_id", household.id).order("created_at");
  if (result.error) throwDataError(result.error, "Could not load your goals.");
  return ((result.data ?? []) as GoalRow[]).map(mapGoal);
}

export async function createSavingsGoal(input: Omit<SavingsGoal, "id">) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("savings_goals").insert({ household_id: household.id, name: input.name, target_amount: input.targetAmount, saved_amount: input.savedAmount, target_date: input.targetDate, monthly_contribution: input.monthlyContribution }).select("id, name, target_amount, saved_amount, target_date, monthly_contribution").single();
  if (result.error) throwDataError(result.error, "Could not create your goal.");
  return mapGoal(result.data as GoalRow);
}

export async function updateSavingsGoal(input: SavingsGoal) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("savings_goals").update({ name: input.name, target_amount: input.targetAmount, saved_amount: input.savedAmount, target_date: input.targetDate, monthly_contribution: input.monthlyContribution }).eq("id", input.id).eq("household_id", household.id).select("id, name, target_amount, saved_amount, target_date, monthly_contribution").single();
  if (result.error) throwDataError(result.error, "Could not update your goal.");
  return mapGoal(result.data as GoalRow);
}

export async function deleteSavingsGoal(id: string) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("savings_goals").delete().eq("id", id).eq("household_id", household.id);
  if (result.error) throwDataError(result.error, "Could not delete your goal.");
}
