"use server";

import { revalidatePath } from "next/cache";
import { createSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "@/lib/data/goals";
import { errorMessage } from "@/lib/data/errors";
import type { SavingsGoal } from "@/lib/goals";

function validate(input: Omit<SavingsGoal, "id">) {
  const name = input.name.trim();
  if (!name || name.length > 100 || !Number.isFinite(input.targetAmount) || input.targetAmount <= 0 || !Number.isFinite(input.savedAmount) || input.savedAmount < 0 || !Number.isFinite(input.monthlyContribution) || input.monthlyContribution < 0 || (input.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.targetDate))) throw new Error("Enter valid goal details.");
  return { ...input, name, targetDate: input.targetDate || null };
}
const refresh = () => { revalidatePath("/goals"); revalidatePath("/dashboard"); };

export async function addGoalAction(input: Omit<SavingsGoal, "id">) { try { const data = await createSavingsGoal(validate(input)); refresh(); return { ok: true as const, data }; } catch (error) { return { ok: false as const, error: errorMessage(error) }; } }
export async function updateGoalAction(input: SavingsGoal) { try { if (!input.id) throw new Error("That goal no longer exists."); const data = await updateSavingsGoal({ id: input.id, ...validate(input) }); refresh(); return { ok: true as const, data }; } catch (error) { return { ok: false as const, error: errorMessage(error) }; } }
export async function deleteGoalAction(id: string) { try { if (!id) throw new Error("That goal no longer exists."); await deleteSavingsGoal(id); refresh(); return { ok: true as const }; } catch (error) { return { ok: false as const, error: errorMessage(error) }; } }
