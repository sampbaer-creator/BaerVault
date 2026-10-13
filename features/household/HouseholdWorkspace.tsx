"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import styles from "./HouseholdWorkspace.module.css";

export function HouseholdWorkspace() {
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Shared vault</p>
        <h2>Household</h2>
        <p className={styles.intro}>
          Manage the people who share your BearVault household. Members of this household
          see the same budgets, transactions, accounts, and holdings.
        </p>
      </header>

      <section className={styles.management} aria-labelledby="household-management-title">
        <div className={styles.heading}>
          <div>
            <h3 id="household-management-title">Household management</h3>
            <p>Invite members, update the household name, and manage member roles.</p>
          </div>
          <span>Clerk protected</span>
        </div>
        <div className={styles.clerk}>
          <OrganizationProfile routing="hash" />
        </div>
      </section>
    </div>
  );
}
