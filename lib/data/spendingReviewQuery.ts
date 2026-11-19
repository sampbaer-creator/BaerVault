import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { MAX_REVIEW_BYTES, MAX_REVIEW_CATEGORIES, MAX_REVIEW_ENTRIES, reviewText, reviewWindow, type SpendingSnapshot } from "@/lib/helpers/spendingReview";
import { DataAccessError, throwDataError } from "./errors";

// Caller must obtain householdId from authenticated membership, never client input.
export async function readSpendingSnapshot(client: ReturnType<typeof createServerSupabaseClient>, householdId: string, year: number, month: number, monthsBack: number): Promise<SpendingSnapshot> {
  const window = reviewWindow(year, month, monthsBack);
  const months = await client.from("budget_months").select("id, year, month", { count: "exact" })
    .eq("household_id", householdId)
    .or(`year.gt.${window.startYear},and(year.eq.${window.startYear},month.gte.${window.startMonth})`)
    .or(`year.lt.${year},and(year.eq.${year},month.lt.${month})`)
    .order("year").order("month").limit(13);
  if (months.error) throwDataError(months.error, "Could not read budget months.");
  if (months.count !== months.data?.length) throw new DataAccessError("Incomplete budget history. Try again later.");
  const snapshot: SpendingSnapshot = { start: window.start, end: window.end, monthsRequested: monthsBack, monthsRecorded: months.data?.length ?? 0, categories: [], transactions: [] };
  if (!months.data?.length) return snapshot;
  const categories = await client.from("budget_categories").select("id, budget_month_id, name, planned_amount", { count: "exact" })
    .eq("household_id", householdId).in("budget_month_id", months.data.map(row => row.id)).order("id").limit(MAX_REVIEW_CATEGORIES + 1);
  if (categories.error) throwDataError(categories.error, "Could not read budget categories.");
  if ((categories.count ?? MAX_REVIEW_CATEGORIES + 1) > MAX_REVIEW_CATEGORIES) throw new DataAccessError("Too many categories for one review. Choose fewer months.");
  if (categories.count !== categories.data?.length) throw new DataAccessError("Incomplete category history. Choose fewer months.");
  if (!categories.data?.length) return snapshot;
  const entries = await client.from("budget_entries").select("budget_category_id, description, amount, entry_date", { count: "exact" })
    .eq("household_id", householdId).in("budget_category_id", categories.data.map(row => row.id))
    .order("entry_date").order("id").limit(MAX_REVIEW_ENTRIES + 1);
  if (entries.error) throwDataError(entries.error, "Could not read budget spending.");
  if ((entries.count ?? MAX_REVIEW_ENTRIES + 1) > MAX_REVIEW_ENTRIES) throw new DataAccessError("Too many purchases for one review. Choose fewer months.");
  if (entries.count !== entries.data?.length) throw new DataAccessError("Incomplete purchase history. Choose fewer months.");
  for (const category of categories.data) {
    const budgetMonth = months.data.find(row => row.id === category.budget_month_id)!;
    const purchases = (entries.data ?? []).filter(row => row.budget_category_id === category.id);
    const categoryName = reviewText(category.name);
    snapshot.categories.push({ year: budgetMonth.year, month: budgetMonth.month, categoryName, planned: Number(category.planned_amount), actual: purchases.reduce((sum, row) => sum + Math.round(Number(row.amount) * 100), 0) / 100 });
    snapshot.transactions.push(...purchases.map(row => ({ categoryName, merchant: reviewText(row.description), amount: Number(row.amount), date: row.entry_date })));
  }
  if (Buffer.byteLength(JSON.stringify(snapshot), "utf8") > MAX_REVIEW_BYTES) throw new DataAccessError("This review is too large. Choose fewer months.");
  return snapshot;
}
