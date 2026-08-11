import { auth, currentUser } from "@clerk/nextjs/server";
import { IconArrowRight, IconCheck, IconHome } from "@tabler/icons-react";
import { redirect } from "next/navigation";

import { completeHouseholdSetup } from "./actions";
import styles from "./setup.module.css";

export default async function HouseholdSetupPage() {
  const { redirectToSignIn } = await auth();
  const user = await currentUser();

  if (!user) return redirectToSignIn();
  if (user.publicMetadata.householdSetupComplete === true) redirect("/dashboard");

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.progress}><span className={styles.done}><IconCheck size={14} /> Account</span><i /><span className={styles.active}>Household</span><i /><span>Dashboard</span></div>
        <div className={styles.icon}><IconHome size={24} /></div>
        <p className={styles.eyebrow}>One last step</p>
        <h1>Set up your household</h1>
        <p className={styles.intro}>This creates the private workspace where you’ll organize your shared financial life.</p>

        <form action={completeHouseholdSetup} className={styles.form}>
          <label htmlFor="householdName">Household name</label>
          <input id="householdName" name="householdName" defaultValue={user.lastName ? `${user.lastName} household` : "My household"} minLength={2} maxLength={60} required />
          <fieldset>
            <legend>Who is this for?</legend>
            <div className={styles.options}>
              <label><input type="radio" name="householdType" value="personal" required /><span><strong>Just me</strong><small>Personal finances</small></span></label>
              <label><input type="radio" name="householdType" value="couple" /><span><strong>Couple</strong><small>Money together</small></span></label>
              <label><input type="radio" name="householdType" value="family" /><span><strong>Family</strong><small>Whole household</small></span></label>
            </div>
          </fieldset>
          <button type="submit">Create household <IconArrowRight size={18} /></button>
        </form>
        <p className={styles.note}>You can invite other household members later.</p>
      </section>
    </main>
  );
}
