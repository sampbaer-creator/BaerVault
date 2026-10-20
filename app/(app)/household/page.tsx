import { HouseholdWorkspace } from "@/features/household/HouseholdWorkspace";
import { getBudgetMonth } from "@/lib/data/budgets";
import { getCurrentHousehold, getHouseholdMembers } from "@/lib/data/households";

export default async function HouseholdPage() {
  const now = new Date();
  const [members, household, budget] = await Promise.all([getHouseholdMembers(), getCurrentHousehold(), getBudgetMonth(now.getFullYear(), now.getMonth() + 1)]);
  const spendByMember = new Map<string, number>();
  for (const category of budget.categories) for (const purchase of category.purchases) if (purchase.createdByClerkUserId) spendByMember.set(purchase.createdByClerkUserId, (spendByMember.get(purchase.createdByClerkUserId) ?? 0) + purchase.amount);
  return <HouseholdWorkspace members={members} householdName={household.name} spendByMember={Object.fromEntries(spendByMember)} monthLabel={budget.month} />;
}
