import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { countTransactionsToReview } from "@/lib/data/bankTransactions";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  if (!orgId) redirect("/onboarding");

  // The review badge is supplemental UI. If the review table is temporarily
  // unavailable, the workspace should still render so the user can access
  // their budget and transactions.
  let reviewCount = 0;
  try {
    reviewCount = await countTransactionsToReview();
  } catch {
    reviewCount = 0;
  }
  return <AppShell reviewCount={reviewCount}>{children}</AppShell>;
}
