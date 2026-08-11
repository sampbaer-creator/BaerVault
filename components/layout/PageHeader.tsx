import { Avatar } from "@mantine/core";

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
        <Avatar color="dark" radius="xl" size={40} aria-label="Samuel Baer profile">
          SB
        </Avatar>
      </header>

      <header className={styles.mobileHeader}>
        <span className={styles.mobileBrand}>BearVault</span>
        <Avatar color="dark" radius="xl" size={36} aria-label="Samuel Baer profile">
          SB
        </Avatar>
      </header>
    </>
  );
}
