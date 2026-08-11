import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { orgId, userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn();
  if (!orgId) redirect("/household/setup");

  return <AppShell>{children}</AppShell>;
}
