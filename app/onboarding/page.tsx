import { OrganizationList } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { IconCheck, IconHome } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import styles from "./setup.module.css";

export default async function OnboardingPage() {
  const { orgId, userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  if (orgId) redirect("/dashboard");

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.progress}><span className={styles.done}><IconCheck size={14} /> Account</span><i /><span className={styles.active}>Household</span><i /><span>Dashboard</span></div>
        <div className={styles.icon}><IconHome size={24} /></div>
        <p className={styles.eyebrow}>One last step</p>
        <h1>Set up your household</h1>
        <p className={styles.intro}>Create a household or select one you have joined. Everyone in the active household shares the same BearVault data.</p>
        <div className={styles.clerkPanel}>
          <OrganizationList hidePersonal skipInvitationScreen={false} afterCreateOrganizationUrl="/dashboard" afterSelectOrganizationUrl="/dashboard" />
        </div>
        <p className={styles.note}>Invite your spouse during setup or later from your household settings.</p>
      </section>
    </main>
  );
}
