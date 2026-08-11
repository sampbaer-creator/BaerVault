"use client";

import { usePathname } from "next/navigation";

import { MobileNav } from "./MobileNav";
import { pageTitles } from "./navigation";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "BearVault";

  return (
    <div className={styles.shell}>
      <Sidebar pathname={pathname} />
      <div className={styles.contentColumn}>
        <PageHeader title={title} />
        <main className={styles.main}>{children}</main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
