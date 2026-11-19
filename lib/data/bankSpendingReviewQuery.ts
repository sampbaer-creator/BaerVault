import { createHash } from "node:crypto";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { MAX_REVIEW_BYTES, MAX_REVIEW_ENTRIES, reviewText, reviewWindow, type SpendingSnapshot } from "@/lib/helpers/spendingReview";
import { DataAccessError, throwDataError } from "./errors";

export function isBankSpendingCategory(category: string | null): boolean {
  const key = (category ?? "").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return !/(^|_)(TRANSFER(S)?|CREDIT_CARD_PAYMENT(S)?|CARD_PAYMENT(S)?|INTERNAL_TRANSFER|ACCOUNT_TRANSFER|LOAN_PAYMENT(S)?|INCOME)(_|$)/.test(key);
}

// householdId must come from getReviewHousehold, never from request input.
// The authenticated publishable-key client also enforces Supabase RLS.
export async function readBankSpendingSnapshot(client: ReturnType<typeof createServerSupabaseClient>, householdId: string, year: number, month: number, monthsBack: number, categoryNames = new Map<string, string>()): Promise<SpendingSnapshot> {
  const window = reviewWindow(year, month, monthsBack);
  const result = await client.from("bank_transactions")
    .select("transaction_date, description, counterparty_name, amount, category", { count: "exact" })
    .eq("household_id", householdId).gte("transaction_date", window.start).lt("transaction_date", window.end)
    .eq("status", "posted").gt("amount", 0).neq("match_status", "excluded")
    .order("transaction_date").order("id").limit(MAX_REVIEW_ENTRIES);
  if (result.error) throwDataError(result.error, "Could not read bank history.");
  if (result.count === null || result.count > MAX_REVIEW_ENTRIES) throw new DataAccessError("Too many bank transactions for one review. Choose fewer months.");
  if (result.count !== result.data?.length) throw new DataAccessError("Incomplete bank history. Choose fewer months.");
  // Plaid preserves positive debit/outflow amounts; credits/refunds are negative.
  const rows = (result.data ?? []).filter(row => isBankSpendingCategory(row.category));
  const snapshot: SpendingSnapshot = { source: "bank", start: window.start, end: window.end, monthsRequested: monthsBack, monthsRecorded: 0, categories: [], transactions: [] };
  // Hash exact provider names so identity is stable across ranges and redaction collisions.
  const names = [...new Set(rows.map(row => row.category || "Uncategorized"))].sort();
  const identities = new Map(names.map(name => [name, "bank_category_" + createHash("sha256").update(name).digest("hex").slice(0, 24)]));
  for (const [name, id] of identities) {
    if (categoryNames.has(id) && categoryNames.get(id) !== name) throw new DataAccessError("Ambiguous provider category identity.");
    categoryNames.set(id, name);
  }
  const months = new Set<string>();
  for (const row of rows) {
    const date = row.transaction_date;
    const amount = Number(row.amount);
    if (date < window.start || date >= window.end || !Number.isFinite(amount) || amount <= 0) throw new DataAccessError("Invalid bank history. Request a new review.");
    const monthKey = date.slice(0, 7);
    months.add(monthKey);
    const categoryId = identities.get(row.category || "Uncategorized")!;
    const categoryName = reviewText(categoryNames.get(categoryId)!);
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    let group = snapshot.categories.find(item => item.year === year && item.month === month && item.categoryId === categoryId);
    if (!group) {
      group = { year, month, categoryId, categoryName, planned: 0, actual: 0 };
      snapshot.categories.push(group);
    }
    group.actual = (Math.round(group.actual * 100) + Math.round(amount * 100)) / 100;
    snapshot.transactions.push({ date, amount, categoryId, categoryName, merchant: reviewText(row.counterparty_name || row.description || "") });
  }
  snapshot.monthsRecorded = months.size;
  if (Buffer.byteLength(JSON.stringify(snapshot), "utf8") > MAX_REVIEW_BYTES) throw new DataAccessError("This review is too large. Choose fewer months.");
  return snapshot;
}

