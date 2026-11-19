import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getReviewHousehold } from "./spendingReview";
import { readBankSpendingSnapshot } from "./bankSpendingReviewQuery";

export async function getBankSpendingSnapshot(year: number, month: number, monthsBack: number) {
  const householdId = await getReviewHousehold();
  const categoryNames = new Map<string, string>();
  const history = await readBankSpendingSnapshot(createServerSupabaseClient(), householdId, year, month, monthsBack, categoryNames);
  return { history, categoryNames };
}
