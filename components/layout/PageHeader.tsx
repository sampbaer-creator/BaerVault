import { UserButton } from "@clerk/nextjs";

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
          <p className={styles.headerSubtitle}>Household workspace</p>
        </div>
        <UserButton />
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
