"use server";

import { refreshFinanceViews } from "@/lib/data/revalidate";
import { isValidDate, isValidMonth } from "@/lib/validation";
import { createBudgetCategory, createBudgetEntry, deleteBudgetCategory, deleteBudgetEntry, updateBudgetCategory, updateBudgetEntry } from "@/lib/data/budgets";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
const validAmount = (value: number, allowZero = false) => Number.isFinite(value) && (allowZero ? value >= 0 : value > 0) && value <= 999999999999;

export async function addCategoryAction(input: { year: number; month: number; name: string; plannedAmount: number }): Promise<Result<Awaited<ReturnType<typeof createBudgetCategory>>>> {
  try {
    const name = input.name.trim();
    if (!isValidMonth(input.year, input.month) || !name || name.length > 80 || !validAmount(input.plannedAmount, true)) throw new DataAccessError("Enter a valid month, category name, and planned amount.");
    const data = await createBudgetCategory(input.year, input.month, name, input.plannedAmount);
    refreshFinanceViews(); return { ok: true, data };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function updateBudgetCategoryAction(categoryId: string, name: string, amount: number): Promise<Result> {
  try {
    const cleanName = name.trim();
    if (!categoryId || !cleanName || cleanName.length > 80 || !validAmount(amount, true)) throw new DataAccessError("Enter a valid category name and planned amount.");
    await updateBudgetCategory(categoryId, cleanName, amount); refreshFinanceViews(); return { ok: true, data: undefined };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function deleteBudgetCategoryAction(id: string): Promise<Result> {
  try { await deleteBudgetCategory(id); refreshFinanceViews(); return { ok:true,data:undefined }; }
  catch(error){ return {ok:false,error:errorMessage(error)}; }
}

export async function saveBudgetEntryAction(input: { id?: string; categoryId: string; description: string; amount: number; date: string; accountId: string | null }): Promise<Result<{ id: string }>> {
  try {
    const description = input.description.trim();
    if (!input.categoryId || !description || description.length > 160 || !validAmount(input.amount) || !isValidDate(input.date)) throw new DataAccessError("Enter a valid description, amount, and date.");
    if (input.accountId !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.accountId)) throw new DataAccessError("Select a valid spending account.");
    if (input.id) await updateBudgetEntry(input.id, description, input.amount, input.date, input.accountId);
    const entry = input.id ? { id: input.id } : await createBudgetEntry(input.categoryId, description, input.amount, input.date, input.accountId);
    refreshFinanceViews(); return { ok: true, data: { id: entry.id } };
  } catch (error) { return { ok: false, error: errorMessage(error) }; }
}

export async function deleteBudgetEntryAction(id: string): Promise<Result> {
  try { await deleteBudgetEntry(id); refreshFinanceViews(); return { ok: true, data: undefined }; }
  catch (error) { return { ok: false, error: errorMessage(error) }; }
}
