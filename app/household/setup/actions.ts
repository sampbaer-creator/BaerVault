"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function completeHouseholdSetup(formData: FormData) {
  const { userId } = await auth.protect();
  const householdName = String(formData.get("householdName") ?? "").trim();
  const householdType = String(formData.get("householdType") ?? "").trim();

  if (householdName.length < 2 || householdName.length > 60) {
    throw new Error("Household name must be between 2 and 60 characters.");
  }
  if (!['personal', 'couple', 'family'].includes(householdType)) {
    throw new Error("Select a valid household type.");
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      householdSetupComplete: true,
      householdName,
      householdType,
    },
  });

  redirect("/dashboard");
}
