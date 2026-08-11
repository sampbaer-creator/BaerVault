"use server";

import { revalidatePath } from "next/cache";
import { createBudgetCategory, createBudgetEntry, deleteBudgetEntry, updateBudgetCategory, updateBudgetEntry } from "@/lib/data/budgets";
import { errorMessage } from "@/lib/data/errors";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const validAmount = (value: number, allowZero = false) => Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) && value <= 999999999999;

export async function addCategoryAction(input: { year: number; month: number; name: string; plannedAmount: number }): Promise<Result<Awaited<ReturnType<typeof createBudgetCategory>>>> {
  try {
    const name = input.name.trim();
    if (!name || name.length > 80 || !validAmount(input.plannedAmount, true)) throw new Error("Enter a valid category name and planned amount.");
    const data = await createBudgetCategory(input.year, input.month, name, input.plannedAmount);
    revalidatePath("/budget"); return { ok: true, data };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function setPlannedAmountAction(categoryId: string, amount: number): Promise<Result> {
  try {
    if (!categoryId || !validAmount(amount, true)) throw new Error("Enter a valid planned amount.");
    await updateBudgetCategory(categoryId, amount); revalidatePath("/budget"); return { ok: true, data: undefined };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function saveBudgetEntryAction(input: { id?: string; categoryId: string; description: string; amount: number; date: string }): Promise<Result<{ id: string }>> {
  try {
    const description = input.description.trim();
    if (!input.categoryId || !description || description.length > 160 || !validAmount(input.amount) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("Enter a valid description, amount, and date.");
    if (input.id) await updateBudgetEntry(input.id, description, input.amount, input.date);
    const entry = input.id ? { id: input.id } : await createBudgetEntry(input.categoryId, description, input.amount, input.date);
    revalidatePath("/budget"); revalidatePath("/cash-flow"); revalidatePath("/dashboard");
    return { ok: true, data: { id: entry.id } };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function deleteBudgetEntryAction(id: string): Promise<Result> {
  try { await deleteBudgetEntry(id); revalidatePath("/budget"); revalidatePath("/cash-flow"); revalidatePath("/dashboard"); return { ok: true, data: undefined }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}
