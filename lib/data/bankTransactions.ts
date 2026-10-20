import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError, throwDataError } from "./errors";
import { getCurrentHousehold } from "./households";
import type { ReviewQueueItem } from "@/lib/helpers/reviewQueue";

type BankTransactionRow = {
  id: string; description: string; amount: number | string; category: string | null;
  transaction_date: string; financial_account_id: string; matched_budget_entry_id: string | null;
};

export async function getTransactionsToReview(year: number, month: number): Promise<ReviewQueueItem[]> {
  const household = await getCurrentHousehold();
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const result = await createServerSupabaseClient().from("bank_transactions")
    .select("id, description, amount, category, transaction_date, financial_account_id, matched_budget_entry_id")
    .eq("household_id", household.id).eq("status", "posted").is("reviewed_at", null)
    .gte("transaction_date", `${year}-${String(month).padStart(2, "0")}-01`)
    .lt("transaction_date", `${next.year}-${String(next.month).padStart(2, "0")}-01`)
    .order("transaction_date", { ascending: false });
  if (result.error) throwDataError(result.error, "Could not load transactions to review.");
  return ((result.data ?? []) as BankTransactionRow[]).map((row) => ({
    id: row.id, description: row.description, amount: Number(row.amount), providerCategory: row.category,
    transactionDate: row.transaction_date, accountId: row.financial_account_id, budgetEntryId: row.matched_budget_entry_id,
  }));
}

export async function countTransactionsToReview(): Promise<number> {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("bank_transactions")
    .select("id", { count: "exact", head: true }).eq("household_id", household.id)
    .eq("status", "posted").is("reviewed_at", null);
  if (result.error) throwDataError(result.error, "Could not count transactions to review.");
  return result.count ?? 0;
}

export async function markBankTransactionReviewed(id: string) {
  const household = await getCurrentHousehold();
  const result = await createServerSupabaseClient().from("bank_transactions")
    .update({ reviewed_at: new Date().toISOString() }).eq("id", id).eq("household_id", household.id)
    .eq("status", "posted").is("reviewed_at", null).select("id").maybeSingle();
  if (result.error) throwDataError(result.error, "Could not mark this transaction reviewed.");
  if (!result.data) throw new DataAccessError("This transaction is already reviewed or no longer available.");
}

export async function markAllBankTransactionsReviewed(year: number, month: number) {
  const household = await getCurrentHousehold();
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const result = await createServerSupabaseClient().from("bank_transactions")
    .update({ reviewed_at: new Date().toISOString() }).eq("household_id", household.id)
    .eq("status", "posted").is("reviewed_at", null)
    .gte("transaction_date", `${year}-${String(month).padStart(2, "0")}-01`)
    .lt("transaction_date", `${next.year}-${String(next.month).padStart(2, "0")}-01`).select("id");
  if (result.error) throwDataError(result.error, "Could not mark transactions reviewed.");
}

export async function recategorizeBankTransaction(id: string, categoryId: string) {
  const household = await getCurrentHousehold();
  const supabase = createServerSupabaseClient();
  const transaction = await supabase.from("bank_transactions").select("matched_budget_entry_id, transaction_date")
    .eq("id", id).eq("household_id", household.id).eq("status", "posted").is("reviewed_at", null).maybeSingle();
  if (transaction.error) throwDataError(transaction.error, "Could not load this transaction.");
  if (!transaction.data?.matched_budget_entry_id) throw new DataAccessError("This transaction has no linked budget entry to recategorize.");
  const category = await supabase.from("budget_categories").select("id, budget_month_id")
    .eq("id", categoryId).eq("household_id", household.id).maybeSingle();
  if (category.error) throwDataError(category.error, "Could not verify this budget category.");
  if (!category.data) throw new DataAccessError("Choose a category in this household.");
  const month = await supabase.from("budget_months").select("year, month")
    .eq("id", category.data.budget_month_id).eq("household_id", household.id).single();
  if (month.error) throwDataError(month.error, "Could not verify this budget month.");
  const transactionDate = transaction.data.transaction_date;
  if (month.data.year !== Number(transactionDate.slice(0, 4)) || month.data.month !== Number(transactionDate.slice(5, 7))) {
    throw new DataAccessError("Choose a category from the transaction’s month.");
  }
  const updated = await supabase.from("budget_entries").update({ budget_category_id: categoryId })
    .eq("id", transaction.data.matched_budget_entry_id).eq("household_id", household.id).select("id").maybeSingle();
  if (updated.error) throwDataError(updated.error, "Could not update the budget category.");
  if (!updated.data) throw new DataAccessError("This transaction’s budget entry is no longer available.");
  await markBankTransactionReviewed(id);
}
