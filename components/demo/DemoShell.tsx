"use client";

import {
  IconArrowsExchange,
  IconChartPie,
  IconHome,
  IconLayoutDashboard,
  IconPigMoney,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
import styles from "./DemoShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";

const links = [
  ["/demo", "Dashboard", IconLayoutDashboard],
  ["/demo/budget", "Budget", IconPigMoney],
  ["/demo/cash-flow", "Cash Flow", IconArrowsExchange],
  ["/demo/investments", "Investments", IconChartPie],
  ["/demo/household", "Household", IconUsers],
  ["/demo/settings", "Settings", IconSettings],
] as const;

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={styles.shell}>
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
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <strong>Demo Household</strong>
          <small>Mock data only · never saved</small>
          <Link href="/sign-up">Create your household</Link>
        </div>
      </aside>
      <div className={styles.content}>
        <header>
          <span className={styles.mobileMark} aria-label="BearVault">
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
        <main>{children}</main>
      </div>
      <nav className={styles.mobileNav}>
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.active : undefined}
          >
            <Icon size={19} />
            <small>{label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}
