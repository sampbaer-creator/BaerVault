"use server";


import { getBankSpendingSnapshot } from "@/lib/data/bankSpendingReview";
import { getReviewHousehold, getSpendingSnapshot } from "@/lib/data/spendingReview";
import { MAX_REVIEW_BYTES } from "@/lib/helpers/spendingReview";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DataAccessError, errorMessage } from "@/lib/data/errors";

import type { BudgetAdvice } from "@/lib/helpers/budgetAdvice";
import { forecastBudget } from "@/lib/helpers/budgetForecast";
import { isValidMonth } from "@/lib/helpers/validation";

export type { BudgetAdvice } from "@/lib/helpers/budgetAdvice";
export type BudgetAdviceResult = { ok: true; data: BudgetAdvice } | { ok: false; error: string };



export async function getBudgetAdviceAction(input: { year: number; month: number; monthsBack?: number; source?: "ledger" | "bank" }): Promise<BudgetAdviceResult> {
  try {
    if (!input || (input.source !== undefined && input.source !== "ledger" && input.source !== "bank") || !isValidMonth(input.year, input.month) || !Number.isInteger(input.monthsBack ?? 6) || (input.monthsBack ?? 6) < 1 || (input.monthsBack ?? 6) > 12) throw new DataAccessError("Select a valid budget month and 1-12 prior months.");

    await getReviewHousehold();
    const quota = await createServerSupabaseClient().rpc("consume_budget_advice_quota");
    if (quota.error) throw new DataAccessError("Budget advice is temporarily unavailable.");
    if (quota.data !== true) return { ok: false, error: "Please wait a minute between reviews. Each household can request up to 20 reviews per day." };
    const source = input.source ?? "ledger";
    const { history, categoryNames } = await (source === "bank" ? getBankSpendingSnapshot : getSpendingSnapshot)(input.year, input.month, input.monthsBack ?? 6);
    if (!history.transactions.length) return { ok: false, error: source === "bank" ? "No eligible posted bank outflows were recorded in this history range. Choose a different range." : "No ledger purchases were recorded in this history range. Choose a different range." };
    const payload = JSON.stringify(history);
    if (Buffer.byteLength(payload, "utf8") > MAX_REVIEW_BYTES) throw new DataAccessError("This review is too large. Choose fewer months.");
    return { ok: true, data: forecastBudget(history, categoryNames) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
