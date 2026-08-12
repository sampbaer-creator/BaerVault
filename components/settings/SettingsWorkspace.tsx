"use client";

import { UserProfile } from "@clerk/nextjs";
import { PreferencesPanel } from "./PreferencesPanel";
import styles from "./SettingsWorkspace.module.css";

export function SettingsWorkspace() {
  return (
    <div className={styles.page}>
      <header>
        <h2>Settings</h2>
        <p>Personalize BearVault and manage your account and security.</p>
      </header>
      <div className={styles.layout}>
        <nav aria-label="Settings sections">
          <a href="#appearance">Appearance</a>
          <a href="#formatting">Formatting</a>
          <a href="#account">Account</a>
        </nav>
        <div className={styles.sections}>
          <PreferencesPanel />
          <section id="account">
            <h3>Account and security</h3>
            <p>Manage your profile, connected login methods, password, and MFA settings.</p>
            <div className={styles.clerk}>
              <UserProfile routing="hash" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
