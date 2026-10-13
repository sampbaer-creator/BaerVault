"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MobileNav } from "./MobileNav";
import { pageTitles } from "./navigation";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";
import { MOBILE_SHELL_INVALIDATE_EVENT } from "@/lib/helpers/mobileShell";
import { parseExplicitMonthSelection } from "@/lib/helpers/monthSelection";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMonth = parseExplicitMonthSelection(searchParams.get("year"), searchParams.get("month"));
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

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener(MOBILE_SHELL_INVALIDATE_EVENT, refresh);
    return () => window.removeEventListener(MOBILE_SHELL_INVALIDATE_EVENT, refresh);
  }, [router]);

  return (
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCompact : ""}`}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <Sidebar pathname={pathname} collapsed={sidebarCollapsed} selectedMonth={selectedMonth} />
      <div className={styles.contentColumn}>
        <PageHeader
          title={title}
          pathname={pathname}
          selectedMonth={selectedMonth}
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
      <MobileNav pathname={pathname} selectedMonth={selectedMonth} />
    </div>
  );
}
