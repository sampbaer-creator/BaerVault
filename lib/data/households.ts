import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { DataAccessError, throwDataError } from "./errors";

export type CurrentHousehold = { id: string; clerkOrgId: string; name: string };

export const getCurrentHousehold = cache(async (): Promise<CurrentHousehold> => {
  const { userId, orgId } = await auth.protect();
  if (!userId) throw new DataAccessError("You must sign in to access household data.");
  if (!orgId) throw new DataAccessError("Select or create a Clerk household before using BaerVault.", "MISSING_ORGANIZATION");

  const supabase = createServerSupabaseClient();
  const existing = await supabase
    .from("households")
    .select("id, clerk_org_id, name")
    .eq("clerk_org_id", orgId)
    .maybeSingle();

  if (existing.error) throwDataError(existing.error, "Could not load your household.");
  if (existing.data) return { id: existing.data.id, clerkOrgId: existing.data.clerk_org_id, name: existing.data.name };

  const clerk = await clerkClient();
  const organization = await clerk.organizations.getOrganization({ organizationId: orgId });
  const inserted = await supabase
    .from("households")
    .insert({ clerk_org_id: orgId, name: organization.name })
    .select("id, clerk_org_id, name")
    .single();

  if (inserted.error?.code === "23505") {
    const raced = await supabase.from("households").select("id, clerk_org_id, name").eq("clerk_org_id", orgId).single();
    if (raced.error) throwDataError(raced.error, "Could not resolve your household.");
    return { id: raced.data.id, clerkOrgId: raced.data.clerk_org_id, name: raced.data.name };
  }
  if (inserted.error) throwDataError(inserted.error, "Could not create your BaerVault household.");
  return { id: inserted.data.id, clerkOrgId: inserted.data.clerk_org_id, name: inserted.data.name };
});

export type HouseholdMember = { userId: string; name: string; imageUrl: string; role: string };

export const getHouseholdMembers = cache(async (): Promise<HouseholdMember[]> => {
  const household = await getCurrentHousehold();
  const clerk = await clerkClient();
  const result = await clerk.organizations.getOrganizationMembershipList({ organizationId: household.clerkOrgId, limit: 100 });
  return result.data.flatMap((membership) => {
    const profile = membership.publicUserData;
    if (!profile?.userId) return [];
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    return [{ userId: profile.userId, name: fullName || profile.identifier || "Household member", imageUrl: profile.imageUrl, role: membership.role }];
  });
});
