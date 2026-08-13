"use client";

import {
  IconArrowsExchange,
  IconChartPie,
  IconHome,
  IconLayoutDashboard,
  IconDots,
  IconPigMoney,
  IconSettings,
  IconTargetArrow,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@mantine/core";

import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
import styles from "./DemoShell.module.css";
import { LiquidGLRuntime } from "@/components/shared/LiquidGLRuntime";

const links = [
  ["/demo", "Overview", IconLayoutDashboard],
  ["/demo/transactions", "Transactions", IconArrowsExchange],
  ["/demo/budget", "Budgets", IconPigMoney],
  ["/demo/investments", "Investments", IconChartPie],
  ["/demo/goals", "Goals", IconTargetArrow],
  ["/demo/household", "Household", IconUsers],
  ["/demo/settings", "Settings", IconSettings],
] as const;

const mobileLinks = links.slice(0, 4);
const moreLinks = links.slice(4);

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpened, setMoreOpened] = useState(false);
  const moreIsActive = moreLinks.some(([href]) => href === pathname);
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
        <main>{children}</main>
      </div>
      <nav className={styles.mobileNav} aria-label="Demo mobile navigation">
        {mobileLinks.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? styles.active : undefined}
            aria-current={pathname === href ? "page" : undefined}
          >
            <Icon size={19} />
            <small>{label}</small>
          </Link>
        ))}
        <button
          type="button"
          className={moreIsActive ? styles.active : undefined}
          onClick={() => setMoreOpened(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpened}
          aria-label="Open more demo navigation options"
        >
          <IconDots size={20} aria-hidden="true" />
          <small>More</small>
        </button>
      </nav>
      <Drawer
        opened={moreOpened}
        onClose={() => setMoreOpened(false)}
        position="bottom"
        size="auto"
        radius="lg"
        title="More"
      >
        <nav className={styles.drawerNav} aria-label="Additional demo navigation">
          {moreLinks.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? styles.active : undefined}
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => setMoreOpened(false)}
            >
              <Icon size={22} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </Drawer>
    </div>
  );
}
