"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import Image from "next/image";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { HouseholdMember } from "@/lib/data/households";
import styles from "./HouseholdWorkspace.module.css";

export function HouseholdWorkspace({ members, householdName, spendByMember, monthLabel }: { members: HouseholdMember[]; householdName: string; spendByMember: Record<string, number>; monthLabel: string }) {
  const money = useCurrencyFormatter();
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>Shared vault</p>
        <h2>Household</h2>
        <p className={styles.intro}>
          Manage the people who share your BaerVault household. Members of this household
          see the same budgets, transactions, accounts, and holdings.
        </p>
      </header>

      <section className={styles.members} aria-labelledby="household-members-title">
        <div className={styles.heading}><div><h3 id="household-members-title">Members</h3><p>{householdName} · spending in {monthLabel}</p></div></div>
        <ul>{members.map((member) => <li key={member.userId}><span className={styles.avatar}>{member.imageUrl ? <Image src={member.imageUrl} alt="" width={44} height={44} /> : member.name.slice(0, 1).toUpperCase()}</span><span className={styles.memberName}><strong>{member.name}</strong><small>{member.role.replace("org:", "")}</small></span><span className={styles.memberSpend}><small>Spent this month</small><strong>{money.format(spendByMember[member.userId] ?? 0)}</strong></span></li>)}</ul>
        <p className={styles.note}>Only purchases logged by a member are attributed. Imported bank purchases may not have a creator.</p>
      </section>

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
