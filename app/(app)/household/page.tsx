import type { Metadata } from "next";

export const metadata: Metadata = { title: "Household" };

import { HouseholdWorkspace } from "@/features/household/HouseholdWorkspace";

export default function HouseholdPage() {
  return <HouseholdWorkspace />;
}
