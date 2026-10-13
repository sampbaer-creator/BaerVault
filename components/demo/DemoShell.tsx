"use client";

import { IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { BaerVaultLogo } from "@/components/brand/BaerVaultLogo";
import { NavigationDrawer } from "@/components/layout/NavigationDrawer";
import { allNavigation, mobileSectionNavigation, pageTitles } from "@/components/layout/navigation";
import styles from "./DemoShell.module.css";

const demoHref = (href: string) => href === "/dashboard" ? "/demo" : `/demo${href}`;

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const route = pathname === "/demo" ? "/dashboard" : pathname.replace(/^\/demo/, "");
  const title = pageTitles[route] ?? "BearVault";
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      mainRef.current?.focus();
      previousPathname.current = pathname;
    }
  }, [pathname]);
  return <div className={styles.shell}>
    <a className={styles.skipLink} href="#demo-main-content">Skip to main content</a>
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <Link className={styles.brand} href="/"><BaerVaultLogo /></Link>
      <p className={styles.demoBadge}>Interactive demo</p>
      <nav>{allNavigation.map(({ href, label, icon: Icon }) => <Link key={href} href={demoHref(href)} aria-current={route === href ? "page" : undefined} className={route === href ? styles.active : undefined}><Icon size={20} aria-hidden="true" />{label}</Link>)}</nav>
      <div className={styles.sidebarFooter}><strong>Demo household</strong><small>Sample data · changes are never saved</small><Link href="/sign-up">Create your household</Link></div>
    </aside>
    <div className={styles.content}>
      <header>
        <span className={styles.mobileMenu}><NavigationDrawer pathname={pathname} demo /></span>
        <div className={styles.headerCopy}><h1>{title}</h1><small>Explore BearVault without signing in</small></div>
        <Link className={styles.createAccount} href="/sign-up">Create account</Link>
        <Link className={styles.mobileExit} href="/" aria-label="Exit demo"><IconX size={24} aria-hidden="true" /></Link>
      </header>
      <main id="demo-main-content" ref={mainRef} tabIndex={-1}>
        <p className={styles.demoNotice}>Demo household · sample data, never saved</p>
        {children}
      </main>
    </div>
    <nav className={styles.mobileNav} aria-label="Demo mobile navigation">
      {mobileSectionNavigation.map(({ href, label, icon: Icon }) => <Link key={href} href={demoHref(href)} aria-current={route === href ? "page" : undefined} className={route === href ? styles.active : undefined}><Icon size={22} aria-hidden="true" /><small>{label}</small></Link>)}
    </nav>
  </div>;
}
