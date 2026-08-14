import { UserButton } from "@clerk/nextjs";
import { IconBell, IconChevronDown, IconSearch } from "@tabler/icons-react";

import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
import styles from "./AppShell.module.css";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <>
      <header className={styles.desktopHeader}>
        <div>
          <h1 className={styles.headerTitle}>{title}</h1>
          <p className={styles.headerSubtitle}>Your complete household financial picture</p>
        </div>
        <div className={styles.headerTools}>
          <label className={styles.searchControl}>
            <IconSearch size={17} aria-hidden="true" />
            <span className={styles.srOnly}>Search BearVault (coming soon)</span>
            <input
              type="search"
              placeholder="Search coming soon"
              disabled
              title="Search is coming soon"
            />
          </label>
          <button className={styles.periodControl} type="button" disabled title="Additional periods are coming soon">This month <IconChevronDown size={16} aria-hidden="true" /></button>
          <button className={styles.iconControl} type="button" disabled aria-label="Notifications (coming soon)" title="Notifications are coming soon"><IconBell size={18} aria-hidden="true" /></button>
          <UserButton />
        </div>
      </header>

      <header className={styles.mobileHeader}>
        <span className={styles.mobileMark} aria-label="BearVault">
          <BearVaultLogo compact />
        </span>
        <strong className={styles.mobileTitle}>{title}</strong>
        <span className={styles.mobileProfile}><UserButton /></span>
      </header>
    </>
  );
}
