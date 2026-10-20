import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { countTransactionsToReview } from "@/lib/data/bankTransactions";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  if (!orgId) redirect("/onboarding");

  const reviewCount = await countTransactionsToReview();
  return <AppShell reviewCount={reviewCount}>{children}</AppShell>;
}
