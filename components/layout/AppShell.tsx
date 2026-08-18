"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { MobileNav } from "./MobileNav";
import { pageTitles } from "./navigation";
import { PageHeader } from "./PageHeader";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";
import { useMobilePageSwipe } from "./useMobilePageSwipe";

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
  const swipe = useMobilePageSwipe(pathname);

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
    return () => window.removeEventListener("scroll", update);
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
        <motion.main
          className={`${styles.main} ${swipe.direction ? styles[`swipe${swipe.direction === "left" ? "Left" : "Right"}`] : ""}`}
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          style={swipe.motionStyle}
          onPointerDown={swipe.onPointerDown}
          onPointerMove={swipe.onPointerMove}
          onPointerUp={swipe.onPointerUp}
          onPointerCancel={swipe.onPointerCancel}
        >
          {children}
        </motion.main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
