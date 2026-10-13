"use client";

import { UserProfile } from "@clerk/nextjs";
import { IconShieldLock } from "@tabler/icons-react";
import { PreferencesPanel } from "./PreferencesPanel";
import { InstallPwaCard } from "@/components/shared/InstallPwaCard";
import styles from "./SettingsWorkspace.module.css";

export function SettingsWorkspace() {
  return (
    <div className={styles.page}>
      <header>
        <h2>Settings</h2>
        <p>Manage display preferences, formatting, and account security.</p>
      </header>
      <div className={styles.layout}>
        <nav aria-label="Settings sections">
          <a href="#theme">Theme</a>
          <a href="#formatting">Formatting</a>
          <a href="#account">Account</a>
        </nav>
        <div className={styles.sections}>
          <PreferencesPanel />
          <InstallPwaCard />
          <section id="account" aria-labelledby="account-title">
            <div className={styles.sectionHeading}>
              <span>
                <IconShieldLock size={18} aria-hidden="true" />
              </span>
              <div>
                <h3 id="account-title">Account and security</h3>
                <p>Manage your profile, login methods, password, and MFA.</p>
              </div>
            </div>
            <div className={styles.clerk}>
              <UserProfile routing="hash" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
