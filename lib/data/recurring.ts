import "server-only";
import { upcomingPayments, type PaymentHistory } from "@/lib/recurring";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentHousehold } from "./households";
import { throwDataError } from "./errors";

export async function getUpcomingPayments(year: number, month: number) {
  const household = await getCurrentHousehold();
  const start = new Date(Date.UTC(year, month - 4, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const from = today >= monthStart && today <= end ? today : monthStart;
  const history: PaymentHistory[] = [];
  // Supabase caps each response; page history instead of silently losing bills.
  for (let offset = 0; ; offset += 1000) {
    const result = await createServerSupabaseClient().from("budget_entries")
      .select("id,description,amount,entry_date,financial_account_id")
      .eq("household_id", household.id).gte("entry_date", start).lte("entry_date", end)
      .order("entry_date").order("id").range(offset, offset + 999);
    if (result.error) throwDataError(result.error, "Could not load upcoming payments.");
    history.push(...result.data.map((p) => ({ id: p.id, description: p.description, amount: Number(p.amount), date: p.entry_date, accountId: p.financial_account_id })));
    if (result.data.length < 1000) break;
  }
  return upcomingPayments(history, from, end);
}
