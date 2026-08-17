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
  IconWallet,
  IconChevronDown,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
import styles from "./DemoShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";

const links = [
  ["/demo", "Dashboard", IconLayoutDashboard],
  ["/demo/transactions", "Transactions", IconArrowsExchange],
  ["/demo/accounts", "Accounts", IconBuildingBank],
  ["/demo/budget", "Budgets", IconPigMoney],
  ["/demo/investments", "Investments", IconChartPie],
  ["/demo/cash-flow", "Cash Flow", IconWallet],
  ["/demo/goals", "Goals", IconTargetArrow],
  ["/demo/household", "Household", IconUsers],
  ["/demo/settings", "Settings", IconSettings],
] as const;

const mobileHrefs = new Set([
  "/demo",
  "/demo/transactions",
  "/demo/budget",
  "/demo/investments",
  "/demo/cash-flow",
]);
const mobileLinks = links.filter(([href]) => mobileHrefs.has(href));

const accountGroups = [
  { label: "Credit cards", accounts: [["BearVault Card", "$552"], ["Everyday Visa", "$0"]] },
  { label: "Cash", accounts: [["Household checking", "$8,420"], ["Emergency savings", "$12,600"]] },
  { label: "Investments", accounts: [["Joint brokerage", "$17,817"], ["Retirement", "$21,603"]] },
] as const;

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      mainRef.current?.focus();
      previousPathname.current = pathname;
    }
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
          <span className={styles.mobileMark} role="img" aria-label="BearVault">
            <BearVaultLogo compact />
          </span>
          <div className={styles.headerCopy}>
            <strong>
              {links.find(([href]) => href === pathname)?.[1] ?? "Demo"}
            </strong>
            <small>Explore BearVault without signing in</small>
          </div>
          <Link href="/sign-up">Create account</Link>
        </header>
        <main id="demo-main-content" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
      </div>
      <nav className={styles.mobileNav} aria-label="Demo mobile navigation">
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
