"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MobileNav } from "./MobileNav";
import { pageTitles } from "./navigation";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "BearVault";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      mainRef.current?.focus();
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCompact : ""}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <LiquidGLRuntime />
      <Sidebar pathname={pathname} collapsed={sidebarCollapsed} />
      <div className={styles.contentColumn}>
        <PageHeader
          title={title}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />
        <main
          className={styles.main}
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
