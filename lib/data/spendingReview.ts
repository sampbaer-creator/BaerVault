import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reviewWindow } from "@/lib/helpers/spendingReview";
import { readSpendingSnapshot } from "./spendingReviewQuery";
import { DataAccessError, throwDataError } from "./errors";

// Deliberately does not use getCurrentHousehold: that helper can create a row.
export async function getReviewHousehold() {
  const { userId, orgId } = await auth.protect();
  if (!userId || !orgId) throw new DataAccessError("Select a household to review spending.");
  const result = await createServerSupabaseClient().from("households").select("id").eq("clerk_org_id", orgId).maybeSingle();
  if (result.error) throwDataError(result.error, "Could not verify your household.");
  if (!result.data) throw new DataAccessError("No household budget history is available.");
  return result.data.id;
}

export async function getSpendingSnapshot(year: number, month: number, monthsBack: number) {
  try { reviewWindow(year, month, monthsBack); } catch { throw new DataAccessError("Select a valid month and 1-12 prior months."); }
  const householdId = await getReviewHousehold();
  const client = createServerSupabaseClient();
  const categoryNames = new Map<string, string>();
  const history = await readSpendingSnapshot(client, householdId, year, month, monthsBack, categoryNames);
  return { history, categoryNames };
}
