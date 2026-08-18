"use client";

import {
  IconArrowsExchange,
  IconBuildingBank,
  IconChartPie,
  IconHome,
  IconLayoutDashboard,
  IconPigMoney,
  IconSettings,
  IconTargetArrow,
  IconUsers,
  IconChevronDown,
  IconCalendarRepeat,
  IconChartHistogram,
  IconUsersGroup,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import styles from "./DemoShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";
import { useMobilePageSwipe } from "@/components/layout/useMobilePageSwipe";

const links = [
  ["/demo", "Dashboard", IconLayoutDashboard],
  ["/demo/transactions", "Transactions", IconArrowsExchange],
  ["/demo/accounts", "Accounts", IconBuildingBank],
  ["/demo/budget", "Budgets", IconPigMoney],
  ["/demo/investments", "Investments", IconChartPie],
  ["/demo/goals", "Goals", IconTargetArrow],
  ["/demo/household", "Household", IconUsers],
  ["/demo/settings", "Settings", IconSettings],
] as const;

const mobileLinks = [
  ["/demo/cash-flow", "Cash flow", IconChartHistogram],
  ["/demo/accounts", "Accounts", IconBuildingBank],
  ["/demo/investments", "Investments", IconChartPie],
  ["/demo/transactions", "Transactions", IconArrowsExchange],
  ["/demo", "Dashboard", IconLayoutDashboard],
  ["/demo/budget", "Budgets", IconPigMoney],
  ["/demo/recurring", "Recurring", IconCalendarRepeat],
  ["/demo/goals", "Goals", IconTargetArrow],
] as const;

const accountGroups = [
  { label: "Credit cards", accounts: [["BearVault Card", "$552"], ["Everyday Visa", "$0"]] },
  { label: "Cash", accounts: [["Household checking", "$8,420"], ["Emergency savings", "$12,600"]] },
  { label: "Investments", accounts: [["Joint brokerage", "$17,817"], ["Retirement", "$21,603"]] },
] as const;

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);
  const swipe = useMobilePageSwipe(pathname, true);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      mainRef.current?.focus();
      previousPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    mobileNavRef.current?.querySelector<HTMLElement>("[aria-current='page']")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#demo-main-content">
        Skip to main content
      </a>
      <LiquidGLRuntime />
      <aside className={styles.sidebar}>
        <div
          className={`${styles.sidebarGlass} liquid-gl-pane`}
          aria-hidden="true"
        />
        <Link className={styles.brand} href="/">
          <span>
            <IconHome size={19} />
          </span>
          BearVault
        </Link>
        <div className={styles.demoBadge}>Interactive demo</div>
        <nav>
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.active : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.accountRail} role="region" aria-label="Demo accounts">
          {accountGroups.map((group) => (
            <section key={group.label}>
              <h2><IconChevronDown size={12} aria-hidden="true" />{group.label}</h2>
              {group.accounts.map(([name, balance]) => (
                <Link href="/demo/accounts" key={name}>
                  <i aria-hidden="true" />
                  <span>{name}</span>
                  <strong>{balance}</strong>
                </Link>
              ))}
            </section>
          ))}
        </div>
        <div className={styles.sidebarFooter}>
          <strong>Demo Household</strong>
          <small>Mock data only · never saved</small>
          <Link href="/sign-up">Create your household</Link>
        </div>
      </aside>
      <div className={styles.content}>
        <header>
          <Link className={styles.mobileMark} href="/demo/settings" aria-label="Open settings"><IconSettings size={24}/></Link>
          <div className={styles.headerCopy}>
            <strong>BearVault</strong>
            <small>Explore BearVault without signing in</small>
          </div>
          <Link className={styles.createAccount} href="/sign-up">Create account</Link>
          <Link className={styles.mobileHousehold} href="/demo/household" aria-label="Open household"><IconUsersGroup size={22}/></Link>
        </header>
        <main className={swipe.direction ? styles[`swipe${swipe.direction === "left" ? "Left" : "Right"}`] : undefined} id="demo-main-content" ref={mainRef} tabIndex={-1} onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
          {children}
        </main>
      </div>
      <nav ref={mobileNavRef} className={styles.mobileNav} aria-label="Demo mobile navigation">
        {mobileLinks.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.active : undefined}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={19} aria-hidden="true" />
            <small>{label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
