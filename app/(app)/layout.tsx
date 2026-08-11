import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const { redirectToSignIn } = await auth();
  const user = await currentUser();

  if (!user) return redirectToSignIn();
  if (user.publicMetadata.householdSetupComplete !== true) redirect("/household/setup");

  return <AppShell>{children}</AppShell>;
}
