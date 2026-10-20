import { OrganizationList } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { IconHome } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { getBudgetMonth } from "@/lib/data/budgets";
import { currentMonth } from "@/lib/helpers/monthSelection";
import { OnboardingSteps } from "./OnboardingSteps";

import styles from "./setup.module.css";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const { orgId, userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const { step } = await searchParams;
  if (orgId) {
    if (step !== "bank" && step !== "budget") redirect("/dashboard");
    const period = currentMonth();
    const budget = step === "budget" ? await getBudgetMonth(period.year, period.month) : null;
    return <OnboardingSteps step={step} period={period} existingCategories={budget?.categories.map(({ id, name, plannedAmount }) => ({ id, name, plannedAmount })) ?? []} />;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.progress} aria-label="Step 1 of 3"><span className={styles.active}>1 of 3 · Household</span><i /><span>Connect bank</span><i /><span>Budget</span></div>
        <div className={styles.icon}><IconHome size={24} /></div>
        <p className={styles.eyebrow}>Step 1 of 3</p>
        <h1>Set up your household</h1>
        <p className={styles.intro}>Create a household or select one you have joined. Everyone in the active household shares the same BaerVault data.</p>
        <div className={styles.clerkPanel}>
          <OrganizationList hidePersonal skipInvitationScreen={false} afterCreateOrganizationUrl="/onboarding?step=bank" afterSelectOrganizationUrl="/dashboard" />
        </div>
        <p className={styles.note}>Invite your spouse during setup or later from your household settings.</p>
      </section>
    </main>
  );
}
