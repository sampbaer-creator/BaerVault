"use server";

import { refreshFinanceViews } from "@/lib/data/revalidate";
import { markAllBankTransactionsReviewed, markBankTransactionReviewed, recategorizeBankTransaction } from "@/lib/data/bankTransactions";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

function validPeriod(year: number, month: number) { return Number.isInteger(year) && year >= 2000 && year <= 2200 && Number.isInteger(month) && month >= 1 && month <= 12; }

export async function markTransactionReviewedAction(id: string) {
  try { if (!id) throw new DataAccessError("Choose a transaction to review."); await markBankTransactionReviewed(id); refreshFinanceViews(); return { ok: true as const }; }
  catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function markAllTransactionsReviewedAction(year: number, month: number) {
  try { if (!validPeriod(year, month)) throw new DataAccessError("Choose a valid month."); await markAllBankTransactionsReviewed(year, month); refreshFinanceViews(); return { ok: true as const }; }
  catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}

export async function recategorizeTransactionAction(id: string, categoryId: string) {
  try { if (!id || !categoryId) throw new DataAccessError("Choose a transaction and category."); await recategorizeBankTransaction(id, categoryId); refreshFinanceViews(); return { ok: true as const }; }
  catch (error) { return { ok: false as const, error: errorMessage(error) }; }
}
