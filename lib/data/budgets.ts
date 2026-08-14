import "server-only";

import type { BudgetMonth } from "@/lib/finance";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";

type BudgetEntryRow = {
  id: string;
  amount: number | string;
  description: string;
  entry_date: string;
  financial_account_id: string | null;
  financial_account?: { name: string } | Array<{ name: string }> | null;
};
type CategoryRow = { id: string; name: string; planned_amount: number | string; budget_entries?: BudgetEntryRow[] };

export async function getBudgetMonth(year: number, month: number): Promise<BudgetMonth & { id: string | null; year: number; monthNumber: number }> {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  const result = await supabase
    .from("budget_months")
    .select("id, year, month, budget_categories(id, name, planned_amount, sort_order, budget_entries(id, description, amount, entry_date, financial_account_id, financial_account:financial_accounts(name)))")
    .eq("household_id", household.id)
    .eq("year", year)
    .eq("month", month)
    .order("sort_order", { referencedTable: "budget_categories", ascending: true })
    .maybeSingle();
  if (result.error) throwDataError(result.error, "Could not load this budget.");

  const income = await supabase
    .from("income_entries")
    .select("id, description, amount, income_date, owner_label")
    .eq("household_id", household.id)
    .gte("income_date", `${year}-${String(month).padStart(2, "0")}-01`)
    .lt("income_date", month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`)
    .order("income_date", { ascending: false });
  if (income.error) throwDataError(income.error, "Could not load household income.");

  const categories = ((result.data?.budget_categories ?? []) as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    plannedAmount: Number(category.planned_amount),
    purchases: (category.budget_entries ?? []).map((entry) => ({
      id: entry.id,
      amount: Number(entry.amount),
      description: entry.description,
      date: entry.entry_date,
      accountId: entry.financial_account_id,
      accountName: Array.isArray(entry.financial_account)
        ? entry.financial_account[0]?.name ?? null
        : entry.financial_account?.name ?? null,
    })),
  }));

  return {
    id: result.data?.id ?? null,
    year,
    monthNumber: month,
    month: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(Date.UTC(year, month - 1, 1))),
    categories,
    incomeEntries: (income.data ?? []).map((entry) => ({
      id: entry.id,
      amount: Number(entry.amount),
      source: entry.description,
      date: entry.income_date,
      owner: entry.owner_label ?? "Household",
    })),
  };
}

async function ensureBudgetMonth(year: number, month: number) {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  const result = await supabase
    .from("budget_months")
    .upsert({ household_id: household.id, year, month }, { onConflict: "household_id,year,month", ignoreDuplicates: false })
    .select("id")
    .single();
  if (result.error) throwDataError(result.error, "Could not create this budget month.");
  return { household, supabase, budgetMonthId: result.data.id };
}

export async function createBudgetCategory(year: number, month: number, name: string, plannedAmount: number) {
  const { household, supabase, budgetMonthId } = await ensureBudgetMonth(year, month);
  const count = await supabase.from("budget_categories").select("id", { count: "exact", head: true }).eq("budget_month_id", budgetMonthId);
  if (count.error) throwDataError(count.error, "Could not prepare this category.");
  const result = await supabase.from("budget_categories").insert({ household_id: household.id, budget_month_id: budgetMonthId, name, planned_amount: plannedAmount, sort_order: count.count ?? 0 }).select("id, name, planned_amount").single();
  if (result.error) throwDataError(result.error, "Could not add the budget category.");
  return { id: result.data.id, name: result.data.name, plannedAmount: Number(result.data.planned_amount), purchases: [] };
}

export async function updateBudgetCategory(categoryId: string, name: string, plannedAmount: number) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("budget_categories").update({ name, planned_amount: plannedAmount }).eq("id", categoryId).eq("household_id", household.id).select("id").single();
  if (result.error) throwDataError(result.error, "Could not update the planned amount.");
}

export async function deleteBudgetCategory(categoryId: string) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("budget_categories").delete().eq("id", categoryId).eq("household_id", household.id);
  if (result.error) throwDataError(result.error, "Could not delete the budget category.");
}

async function verifyFinancialAccount(
  accountId: string | null,
  householdId: string,
  supabase: ReturnType<typeof createServerSupabaseClient>,
) {
  if (!accountId) return;
  const account = await supabase
    .from("financial_accounts")
    .select("id")
    .eq("id", accountId)
    .eq("household_id", householdId)
    .maybeSingle();
  if (account.error) throwDataError(account.error, "Could not verify the spending account.");
  if (!account.data) throw new DataAccessError("Select an account from this household.");
}

export async function createBudgetEntry(categoryId: string, description: string, amount: number, entryDate: string, accountId: string | null) {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  await verifyFinancialAccount(accountId, household.id, supabase);
  const result = await supabase.from("budget_entries").insert({ household_id: household.id, budget_category_id: categoryId, description, amount, entry_date: entryDate, financial_account_id: accountId }).select("id, description, amount, entry_date, financial_account_id").single();
  if (result.error) throwDataError(result.error, "Could not add the spending entry.");
  return { id: result.data.id, description: result.data.description, amount: Number(result.data.amount), date: result.data.entry_date, accountId: result.data.financial_account_id };
}

export async function updateBudgetEntry(entryId: string, description: string, amount: number, entryDate: string, accountId: string | null) {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  await verifyFinancialAccount(accountId, household.id, supabase);
  const result = await supabase.from("budget_entries").update({ description, amount, entry_date: entryDate, financial_account_id: accountId }).eq("id", entryId).eq("household_id", household.id).select("id").single();
  if (result.error) throwDataError(result.error, "Could not update the spending entry.");
}

export async function deleteBudgetEntry(entryId: string) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("budget_entries").delete().eq("id", entryId).eq("household_id", household.id);
  if (result.error) throwDataError(result.error, "Could not delete the spending entry.");
}
