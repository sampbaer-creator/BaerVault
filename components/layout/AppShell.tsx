"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue } from "motion/react";

import { MobileNav } from "./MobileNav";
import { mobileRouteOrder, pageTitles } from "./navigation";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";
import { MobilePager } from "./MobilePager";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "BearVault";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileScrolled, setMobileScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);
  const pagerProgress = useMotionValue(Math.max(0, mobileRouteOrder.indexOf(pathname)));
  const [pager, setPager] = useState<{ activeIndex: number; navigate: (href: string) => void; enabled: boolean }>({ activeIndex: mobileRouteOrder.indexOf(pathname), navigate: () => undefined, enabled: false });
  const updatePager = useCallback((activeIndex: number, navigate: (href: string) => void, enabled: boolean) => setPager((current) => current.activeIndex === activeIndex && current.navigate === navigate && current.enabled === enabled ? current : { activeIndex, navigate, enabled }), []);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      mainRef.current?.focus();
      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const update = () => setMobileScrolled(window.scrollY > 10);
    update();
    window.addEventListener("scroll", update, { passive: true });
    const mobileUpdate = (event: Event) => setMobileScrolled(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("bearvault:mobile-scroll", mobileUpdate);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("bearvault:mobile-scroll", mobileUpdate); };
  }, []);

  return (
    <div className={`${styles.shell} ${sidebarCollapsed ? styles.shellCompact : ""} ${mobileScrolled ? styles.mobileScrolled : ""}`}>
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
          <MobilePager pathname={pathname} progress={pagerProgress} onActiveIndex={updatePager}>{children}</MobilePager>
        </main>
      </div>
      <MobileNav pathname={pathname} progress={pagerProgress} activeIndex={pager.activeIndex} navigate={pager.navigate} pagerEnabled={pager.enabled} />
    </div>
  );
}
