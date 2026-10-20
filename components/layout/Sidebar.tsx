import { OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

import {
  primaryNavigation,
  type NavigationItem,
} from "./navigation";
import styles from "./AppShell.module.css";
import { BaerVaultLogo } from "@/components/brand/BaerVaultLogo";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";

type SidebarProps = {
  pathname: string;
  collapsed?: boolean;
  selectedMonth?: MonthSelection;
  reviewCount?: number;
};

type NavigationSectionProps = {
  label: string;
  items: NavigationItem[];
  pathname: string;
  selectedMonth?: MonthSelection;
  reviewCount?: number;
};

function NavigationSection({ label, items, pathname, selectedMonth, reviewCount = 0 }: NavigationSectionProps) {
  return (
    <section
      className={styles.navSection}
      aria-labelledby={`nav-${label.toLowerCase()}`}
    >
      <p className={styles.navLabel} id={`nav-${label.toLowerCase()}`}>
        {label}
      </p>
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            href={selectedMonth ? withMonth(href, selectedMonth) : href}
            aria-current={isActive ? "page" : undefined}
            key={href}
          >
            <Icon size={19} stroke={1.8} aria-hidden="true" />
            <span>{itemLabel}</span>
            {href === "/transactions" && reviewCount > 0 && <span className={styles.navBadge} aria-label={`${reviewCount} to review`}>{reviewCount}</span>}
          </Link>
        );
      })}
    </section>
  );
}

export function Sidebar({ pathname, collapsed = false, selectedMonth, reviewCount = 0 }: SidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCompact : ""}`}
      aria-label="Primary navigation"
    >
      <div
        className={`${styles.sidebarGlass} liquid-gl-pane glass-panel`}
        aria-hidden="true"
      />
      <div className={styles.brand}>
        <BaerVaultLogo compact={collapsed} />
      </div>

      <nav className={styles.sidebarNav}>
        <NavigationSection
          label="Main"
          items={primaryNavigation}
          pathname={pathname}
          selectedMonth={selectedMonth}
          reviewCount={reviewCount}
        />
      </nav>

      <div className={styles.sidebarFooter}>
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>
    </aside>
  );
}
